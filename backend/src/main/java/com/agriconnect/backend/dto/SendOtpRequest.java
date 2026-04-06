package com.agriconnect.backend.dto;

import lombok.Data;

@Data
public class SendOtpRequest {
    private String name;
    private String username;
    private String phone;
    private String role;
    private String city;
}