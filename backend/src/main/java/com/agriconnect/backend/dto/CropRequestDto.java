package com.agriconnect.backend.dto;

import lombok.Data;

@Data
public class CropRequestDto {
    private Long cropId;
    private Double quantity;
    private String unit;
    private Double offeredPrice;
    private String message;
    private String urgency;
    private String deliveryDate;
}