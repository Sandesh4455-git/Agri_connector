package com.agriconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "government_schemes")
@Data
public class GovernmentScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String category; // income, crop, irrigation, testing
    private String eligibility;
    private String subsidy;
    private String deadline;
    private String status; // active, closed
    private String officialLink;

    @Column(columnDefinition = "TEXT")
    private String fullDescription;

    @Column(columnDefinition = "TEXT")
    private String requiredDocuments; // stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria; // stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String benefits; // stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String applicationProcess; // stored as JSON string

    private LocalDateTime createdAt = LocalDateTime.now();
}