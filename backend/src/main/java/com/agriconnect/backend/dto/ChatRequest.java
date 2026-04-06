// ChatRequest.java 
package com.agriconnect.backend.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private String userType; // "farmer", "dealer", "customer", "admin", "government"
    private String language; // "marathi", "hindi", "english"
    private String sessionId;
}