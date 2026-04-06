package com.agriconnect.backend.dto;

import lombok.Data;

@Data
public class CropRequest {
    private String name;
    private String category;
    private Double quantity;
    private String unit;
    private Double pricePerUnit;
    private String city;
    private String state;
    private String description;
    private String imageUrl;
}