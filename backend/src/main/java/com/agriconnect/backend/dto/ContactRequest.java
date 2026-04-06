package com.agriconnect.backend.dto;

import lombok.Data;

@Data
public class ContactRequest {
    private String name;
    private String email;
    private String phone;
    private String message;
}