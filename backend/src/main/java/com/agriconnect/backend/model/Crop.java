package com.agriconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "crops")
@Data
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(nullable = false)
    private String name; // e.g. Wheat, Rice, Tomato

    private String category; // e.g. Grain, Vegetable, Fruit

    @Column(nullable = false)
    private Double quantity; // in kg/quintal

    private String unit; // kg, quintal, ton

    @Column(nullable = false)
    private Double pricePerUnit; // price farmer wants

    private String city;
    private String state;
    private String description;
    private String imageUrl;

    private boolean available = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}