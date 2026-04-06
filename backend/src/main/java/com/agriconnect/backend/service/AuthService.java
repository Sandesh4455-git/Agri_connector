package com.agriconnect.backend.service;

import com.agriconnect.backend.config.JwtUtil;
import com.agriconnect.backend.dto.*;
import com.agriconnect.backend.model.Notification;
import com.agriconnect.backend.model.OtpStore;
import com.agriconnect.backend.model.User;
import com.agriconnect.backend.repository.NotificationRepository;
import com.agriconnect.backend.repository.OtpRepository;
import com.agriconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final Fast2SmsService fast2SmsService; // ← NEW

    // ─────────────────────────────────────────
    // SEND OTP
    // ─────────────────────────────────────────
    public ApiResponse sendOtp(SendOtpRequest req) {

        if (userRepository.existsByUsername(req.getUsername())) {
            return new ApiResponse(false, "Username already taken");
        }

        if (userRepository.existsByPhone(req.getPhone())) {
            return new ApiResponse(false, "Phone already registered");
        }

        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        // Delete old OTP if exists
        otpRepository.findByPhone(req.getPhone())
                .ifPresent(otpRepository::delete);

        OtpStore otpStore = new OtpStore();
        otpStore.setPhone(req.getPhone());
        otpStore.setName(req.getName());
        otpStore.setUsername(req.getUsername());
        otpStore.setRole(req.getRole());
        otpStore.setCity(req.getCity());
        otpStore.setOtp(otp);
        otpStore.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otpRepository.save(otpStore);

        // ── SMS पाठवा ────────────────────────────────────────────────────
        fast2SmsService.sendOtp(req.getPhone(), otp); // ← NEW
        // ─────────────────────────────────────────────────────────────────

        log.info("OTP: {} | Phone: {}", otp, req.getPhone());

        return new ApiResponse(true, "OTP sent successfully", otp);
    }

    // ─────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────
    public ApiResponse register(RegisterRequest req) {

        OtpStore otpStore = otpRepository.findByPhone(req.getPhone())
                .orElse(null);

        if (otpStore == null) {
            return new ApiResponse(false, "Please request an OTP first");
        }

        if (LocalDateTime.now().isAfter(otpStore.getExpiresAt())) {
            otpRepository.delete(otpStore);
            return new ApiResponse(false, "OTP has expired");
        }

        if (!otpStore.getOtp().equals(req.getOtp())) {
            otpStore.setAttempts(otpStore.getAttempts() + 1);
            otpRepository.save(otpStore);
            return new ApiResponse(false, "Invalid OTP");
        }

        User user = new User();
        user.setName(req.getName());
        user.setUsername(req.getUsername());
        user.setPhone(req.getPhone());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(User.Role.valueOf(req.getRole()));
        user.setCity(req.getCity());
        user.setVerified(true);

        userRepository.save(user);
        otpRepository.delete(otpStore);

        return new ApiResponse(true, "Registration successful!");
    }

    // ─────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────
    public ApiResponse login(LoginRequest req) {

        User user = userRepository.findByUsername(req.getUsername())
                .orElse(null);

        if (user == null) {
            return new ApiResponse(false, "Invalid username or password");
        }

        if (!user.getRole().name().equals(req.getRole())) {
            return new ApiResponse(false,
                    "You are registered as " + user.getRole() +
                            ", please select the correct role");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return new ApiResponse(false, "Invalid password");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().name());

        if (notificationRepository.countByUsername(user.getUsername()) == 0) {
            notificationService.create(
                    user.getUsername(),
                    Notification.NotificationType.SYSTEM,
                    "Welcome to AgriConnect! 🌾",
                    "Your account is ready. Start by adding your crops.",
                    Notification.Priority.HIGH);
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", token);
        responseData.put("id", user.getId());
        responseData.put("username", user.getUsername());
        responseData.put("name", user.getName());
        responseData.put("phone", user.getPhone());
        responseData.put("role", user.getRole().name());
        responseData.put("city", user.getCity());

        return new ApiResponse(true, "Login successful", responseData);
    }

    // ─────────────────────────────────────────
    // CHECK USERNAME
    // ─────────────────────────────────────────
    public boolean checkUsername(String username) {
        return !userRepository.existsByUsername(username);
    }

    // ─────────────────────────────────────────
    // CHANGE PASSWORD
    // ─────────────────────────────────────────
    public ApiResponse changePassword(String username,
            String currentPassword,
            String newPassword) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return new ApiResponse(false, "Current password is incorrect", null);
        }

        if (newPassword == null || newPassword.length() < 6) {
            return new ApiResponse(false,
                    "New password must be at least 6 characters", null);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return new ApiResponse(true, "Password changed successfully", null);
    }

    // ─────────────────────────────────────────
    // DELETE ACCOUNT
    // ─────────────────────────────────────────
    @Transactional
    public ApiResponse deleteAccount(String username) {
        userRepository.deleteByUsername(username);
        return new ApiResponse(true, "Account deleted successfully", null);
    }
}