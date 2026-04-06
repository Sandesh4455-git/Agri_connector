package com.agriconnect.backend.service;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP store for Forgot Password flow.
 * NOTE: This is named OtpService to avoid conflict with OtpStore JPA entity in
 * model package.
 */
@Component
public class OtpService {

    private record OtpEntry(String otp, LocalDateTime expiry, boolean verified) {
    }

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    // OTP save करताना verified = false
    public void saveOtp(String contact, String otp, int expiryMinutes) {
        store.put(contact, new OtpEntry(otp, LocalDateTime.now().plusMinutes(expiryMinutes), false));
    }

    // ✅ NEW: resetToken save करताना verified = true
    public void saveVerifiedToken(String resetToken, int expiryMinutes) {
        store.put(resetToken, new OtpEntry("VERIFIED", LocalDateTime.now().plusMinutes(expiryMinutes), true));
    }

    public boolean verifyOtp(String contact, String otp) {
        OtpEntry entry = store.get(contact);
        if (entry == null)
            return false;
        if (LocalDateTime.now().isAfter(entry.expiry())) {
            store.remove(contact);
            return false;
        }
        if (!entry.otp().equals(otp))
            return false;
        store.put(contact, new OtpEntry(entry.otp(), entry.expiry(), true));
        return true;
    }

    public boolean isVerified(String resetToken) {
        OtpEntry entry = store.get(resetToken);
        return entry != null && entry.verified()
                && LocalDateTime.now().isBefore(entry.expiry());
    }

    public void remove(String key) {
        store.remove(key);
    }
}