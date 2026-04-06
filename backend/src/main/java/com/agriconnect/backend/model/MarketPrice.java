package com.agriconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "market_prices")
@Data
public class MarketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String crop;
    private String category;
    private Double currentPrice;

    @Column(name = "price_change") // ← ONLY THIS LINE ADDED
    private Double change;

    private String trend;
    private String unit;
    private String market;
    private String region;
    private String demand;
    private String prediction;
    private LocalDateTime updatedAt = LocalDateTime.now();
}