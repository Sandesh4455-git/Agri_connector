package com.agriconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String phone;

    private String email;
    private String city;
    private String state;
    private String farmSize; // ← ADDED
    private String experience; // ← ADDED
    private String address; // ← ADDED

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean verified = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        farmer, dealer, customer, admin
    }
}