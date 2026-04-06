package com.agriconnect.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * SmsService — ForgotPasswordController साठी stub
 * Actual SMS Fast2SmsService मधून जातो
 */
@Slf4j
@Service
public class SmsService {

    private final Fast2SmsService fast2SmsService;

    public SmsService(Fast2SmsService fast2SmsService) {
        this.fast2SmsService = fast2SmsService;
    }

    public boolean sendOtp(String mobile, String otp) {
        return fast2SmsService.sendOtp(mobile, otp);
    }
}