package com.agriconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // PayU IDs (renamed from Razorpay)
    private String payuTxnId; // our txnid sent to PayU (TXN-xxx)
    private String payuPaymentId; // payuMoneyId received after payment

    // Who is paying whom
    private String fromUsername; // dealer paying
    private String toUsername; // farmer receiving

    // Payment details
    private Double amount;
    private String currency = "INR";
    private String cropName;
    private Double quantity;
    private String unit;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String description;
    private String invoiceNumber;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED, PARTIAL
    }

    public enum PaymentMethod {
        UPI, BANK_TRANSFER, CASH, WALLET, CARD, NET_BANKING
    }
}