package com.agriconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_store")
@Data
public class OtpStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phone;
    private String username;
    private String name;
    private String otp;
    private String role;
    private String city;
    private LocalDateTime expiresAt;
    private int attempts = 0;
}