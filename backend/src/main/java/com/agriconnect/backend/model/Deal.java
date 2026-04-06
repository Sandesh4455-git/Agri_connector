package com.agriconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "deals")
@Data
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "farmer_id")
    private User farmer;

    @ManyToOne
    @JoinColumn(name = "dealer_id")
    private User dealer;

    @ManyToOne
    @JoinColumn(name = "crop_id")
    private Crop crop;

    private Double quantity;
    private String unit;
    private Double price;
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private DealStatus status = DealStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus = DeliveryStatus.PROCESSING;

    private LocalDateTime dealDate = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum DealStatus {
        PENDING, ACTIVE, COMPLETED, CANCELLED
    }

    public enum PaymentStatus {
        PENDING, PARTIAL, PAID, REFUNDED
    }

    public enum DeliveryStatus {
        PROCESSING, PACKED, IN_TRANSIT, DELIVERED, CANCELLED
    }
}