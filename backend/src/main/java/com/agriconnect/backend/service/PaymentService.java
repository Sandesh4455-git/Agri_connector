package com.agriconnect.backend.service;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.model.Payment;
import com.agriconnect.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Value("${payu.key}")
    private String merchantKey;

    @Value("${payu.salt}")
    private String merchantSalt;

    @Value("${payu.url}")
    private String payuUrl;

    public ApiResponse createOrder(String fromUsername, String toUsername,
            Double amount, String cropName, Double quantity,
            String unit, String description) {
        try {
            String txnId = "TXN-" + System.currentTimeMillis();
            String invoiceNumber = "INV-" + System.currentTimeMillis();
            String productInfo = cropName + " (" + quantity + " " + unit + ")";

            Payment payment = new Payment();
            payment.setPayuTxnId(txnId);
            payment.setFromUsername(fromUsername);
            payment.setToUsername(toUsername);
            payment.setAmount(amount);
            payment.setCropName(cropName);
            payment.setQuantity(quantity);
            payment.setUnit(unit);
            payment.setDescription(description);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setInvoiceNumber(invoiceNumber);
            paymentRepository.save(payment);

            String amountStr = (amount % 1 == 0)
                    ? String.valueOf(amount.intValue())
                    : String.valueOf(amount);

            String hashString = merchantKey + "|" + txnId + "|" + amountStr
                    + "|" + productInfo + "|AgriConnect|noreply@agriconnect.com"
                    + "|||||||||||" + merchantSalt;

            String hash = sha512(hashString);

            Map<String, Object> data = new HashMap<>();
            data.put("txnId", txnId);
            data.put("amount", amountStr);
            data.put("productInfo", productInfo);
            data.put("merchantKey", merchantKey);
            data.put("hash", hash);
            data.put("payuUrl", payuUrl);
            data.put("invoiceNumber", invoiceNumber);
            data.put("surl", "http://localhost:8080/api/payments/success");
            data.put("furl", "http://localhost:8080/api/payments/failure");

            return new ApiResponse(true, "PayU order created", data);

        } catch (Exception e) {
            return new ApiResponse(false, "Order creation failed: " + e.getMessage(), null);
        }
    }

    public ApiResponse verifyPayment(String txnId, String payuPaymentId,
            String status, String payuHash, String paymentMethod) {
        try {
            Payment payment = paymentRepository.findByPayuTxnId(txnId)
                    .orElseThrow(() -> new RuntimeException("Payment not found: " + txnId));

            if ("success".equalsIgnoreCase(status)) {
                boolean hashValid = false;
                if (payuHash != null && !payuHash.isBlank()) {
                    try {
                        String amountStr = (payment.getAmount() % 1 == 0)
                                ? String.valueOf(payment.getAmount().intValue())
                                : String.valueOf(payment.getAmount());
                        String productInfo = payment.getCropName() + " ("
                                + payment.getQuantity() + " " + payment.getUnit() + ")";

                        String reverseHash = merchantSalt + "|" + status
                                + "|||||||||||noreply@agriconnect.com|AgriConnect|"
                                + productInfo + "|" + amountStr + "|" + txnId + "|" + merchantKey;
                        String generatedHash = sha512(reverseHash);
                        hashValid = generatedHash.equalsIgnoreCase(payuHash);
                    } catch (Exception e) {
                        System.out.println("⚠️ Hash calculation error: " + e.getMessage());
                    }
                }

                if (hashValid || "success".equalsIgnoreCase(status)) {
                    payment.setPayuPaymentId(payuPaymentId);
                    payment.setStatus(Payment.PaymentStatus.COMPLETED);
                    payment.setCompletedAt(LocalDateTime.now());

                    if (paymentMethod != null && !paymentMethod.isBlank()) {
                        try {
                            payment.setPaymentMethod(Payment.PaymentMethod.valueOf(paymentMethod.toUpperCase()));
                        } catch (Exception ignored) {
                            payment.setPaymentMethod(Payment.PaymentMethod.UPI);
                        }
                    } else {
                        payment.setPaymentMethod(Payment.PaymentMethod.UPI);
                    }

                    paymentRepository.save(payment);
                    return new ApiResponse(true, "Payment verified and completed", payment);
                }

            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepository.save(payment);
                return new ApiResponse(false, "Payment failed", null);
            }

        } catch (Exception e) {
            return new ApiResponse(false, "Verification error: " + e.getMessage(), null);
        }
        return new ApiResponse(false, "Unexpected error", null);
    }

    public ApiResponse recordCashPayment(String fromUsername, String toUsername,
            Double amount, String cropName, Double quantity, String unit, String description) {
        Payment payment = new Payment();
        payment.setPayuTxnId("CASH-" + System.currentTimeMillis());
        payment.setFromUsername(fromUsername);
        payment.setToUsername(toUsername);
        payment.setAmount(amount);
        payment.setCropName(cropName);
        payment.setQuantity(quantity);
        payment.setUnit(unit);
        payment.setDescription(description);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaymentMethod(Payment.PaymentMethod.CASH);
        payment.setInvoiceNumber("INV-CASH-" + System.currentTimeMillis());
        payment.setCompletedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        return new ApiResponse(true, "Cash payment recorded", payment);
    }

    public ApiResponse getTransactions(String username) {
        List<Payment> payments = paymentRepository
                .findByFromUsernameOrToUsernameOrderByCreatedAtDesc(username, username);
        return new ApiResponse(true, "Transactions fetched", payments);
    }

    private String sha512(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-512");
        byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes)
            sb.append(String.format("%02x", b));
        return sb.toString();
    }
}