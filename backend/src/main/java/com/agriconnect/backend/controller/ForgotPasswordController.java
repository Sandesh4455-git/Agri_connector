package com.agriconnect.backend.controller;

import com.agriconnect.backend.model.User;
import com.agriconnect.backend.repository.UserRepository;
import com.agriconnect.backend.service.EmailService;
import com.agriconnect.backend.service.OtpService;
import com.agriconnect.backend.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth/forgot-password")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final SmsService smsService;
    private final EmailService emailService;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String contact = body.get("contact");
        String type = body.get("type");

        if (contact == null || contact.isBlank() || type == null)
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Contact and type required."));

        Optional<User> userOpt = "mobile".equals(type)
                ? userRepository.findByPhone(contact)
                : userRepository.findByEmail(contact);

        if (userOpt.isEmpty())
            return ResponseEntity.status(404)
                    .body(Map.of("success", false, "message",
                            "या " + ("mobile".equals(type) ? "mobile number" : "email") + " ने account नाही."));

        String otp = String.format("%06d", new Random().nextInt(1000000));
        try {
            if ("mobile".equals(type))
                smsService.sendOtp(contact, otp);
            else
                emailService.sendOtpEmail(contact, otp);
            otpService.saveOtp(contact, otp, 10);
            System.out.println("OTP [" + type + "] " + contact + " = " + otp);
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP sent!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String contact = body.get("contact");
        String otp = body.get("otp");
        if (!otpService.verifyOtp(contact, otp))
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "INVALID_OTP"));

        String resetToken = contact + "::" + UUID.randomUUID();

        // ✅ FIX: saveVerifiedToken वापरतो — verified=true सेट होतो
        otpService.saveVerifiedToken(resetToken, 10);

        return ResponseEntity.ok(Map.of("success", true, "resetToken", resetToken));
    } 

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String resetToken  = body.get("resetToken");
        String newPassword = body.get("newPassword");
        if (resetToken == null || newPassword == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing fields."));
        if (newPassword.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Min 8 characters."));
        if (!otpService.isVerified(resetToken))
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Invalid session."));
        String contact = resetToken.split("::")[0];
        Optional<User> userOpt = userRepository.findByPhone(contact)
                .or(() -> userRepository.findByEmail(contact));
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found."));
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpService.remove(contact);
        otpService.remove(resetToken);
        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successful!"));
    }
}