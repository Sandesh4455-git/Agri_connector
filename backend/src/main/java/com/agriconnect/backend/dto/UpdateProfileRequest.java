package com.agriconnect.backend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String city;
    private String state;
    private String farmSize;
    private String experience;
    private String address;
}