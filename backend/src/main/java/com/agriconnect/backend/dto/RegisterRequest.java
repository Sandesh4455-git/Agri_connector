package com.agriconnect.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String username;
    private String phone;
    private String password;
    private String role;
    private String city;
    private String otp;
}