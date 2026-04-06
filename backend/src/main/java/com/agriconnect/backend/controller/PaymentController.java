package com.agriconnect.backend.controller;

import com.agriconnect.backend.config.JwtUtil;
import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.service.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;

    private String getUsername(String auth) {
        return jwtUtil.extractUsername(auth.replace("Bearer ", ""));
    }

    // ── CREATE PAYU ORDER ──────────────────────────────────────────────────
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse> createOrder(
            @RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String auth) {
        String fromUsername = getUsername(auth);
        return ResponseEntity.ok(paymentService.createOrder(
                fromUsername,
                (String) body.get("toUsername"),
                Double.valueOf(body.get("amount").toString()),
                (String) body.get("cropName"),
                Double.valueOf(body.get("quantity").toString()),
                (String) body.get("unit"),
                (String) body.get("description")));
    }

    // ── RECORD CASH PAYMENT ────────────────────────────────────────────────
    @PostMapping("/cash")
    public ResponseEntity<ApiResponse> cashPayment(
            @RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String auth) {
        String fromUsername = getUsername(auth);
        return ResponseEntity.ok(paymentService.recordCashPayment(
                fromUsername,
                (String) body.get("toUsername"),
                Double.valueOf(body.get("amount").toString()),
                (String) body.get("cropName"),
                Double.valueOf(body.get("quantity").toString()),
                (String) body.get("unit"),
                (String) body.get("description")));
    }

    // ── PAYU SUCCESS CALLBACK ──────────────────────────────────────────────
    @PostMapping("/success")
    public void paymentSuccess(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        String txnId = params.get("txnid");
        String payuId = params.get("payuMoneyId");
        String status = params.get("status");
        String hash = params.get("hash");
        String mode = params.get("mode");

        System.out.println("✅ PayU Success Callback: txnId=" + txnId + " status=" + status);

        try {
            paymentService.verifyPayment(txnId, payuId, status, hash, mode);
            // ✅ FIXED: /payment-success ला redirect करा
            response.sendRedirect(
                    "http://localhost:5173/payment-success?status=success&txnid=" + txnId);
        } catch (Exception e) {
            System.out.println("❌ Payment verification failed: " + e.getMessage());
            response.sendRedirect(
                    "http://localhost:5173/payment-success?status=failed&txnid=" + txnId);
        }
    }

    // ── PAYU FAILURE CALLBACK ──────────────────────────────────────────────
    @PostMapping("/failure")
    public void paymentFailure(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        String txnId = params.get("txnid");
        String status = params.get("status");
        String error = params.get("error_Message");

        System.out.println("❌ PayU Failure Callback: txnId=" + txnId
                + " status=" + status + " error=" + error);

        try {
            paymentService.verifyPayment(txnId, null, status, null, null);
        } catch (Exception e) {
            System.out.println("Error recording failure: " + e.getMessage());
        }

        // ✅ FIXED: /payment-success ला redirect करा (failed status सह)
        response.sendRedirect(
                "http://localhost:5173/payment-success?status=failed&txnid=" + txnId);
    }

    // ── GET TRANSACTIONS ───────────────────────────────────────────────────
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse> getTransactions(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(paymentService.getTransactions(getUsername(auth)));
    }
}