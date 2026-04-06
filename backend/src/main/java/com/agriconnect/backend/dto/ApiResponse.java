package com.agriconnect.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuppressWarnings("rawtypes")
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    // 2-arg constructor so old callers still compile
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.data = null;
    }
}