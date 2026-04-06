package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.*;
import com.agriconnect.backend.service.AuthService;
import com.agriconnect.backend.config.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.agriconnect.backend.service.Fast2SmsService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder; // ✅ ADD THIS
    private final Fast2SmsService fast2SmsService;

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@RequestBody SendOtpRequest req) {
        return ResponseEntity.ok(authService.sendOtp(req));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<ApiResponse> checkUsername(@PathVariable String username) {
        boolean available = authService.checkUsername(username);
        return ResponseEntity.ok(new ApiResponse(available,
                available ? "Username available" : "Username taken"));
    }

    // ✅ TEMPORARY — Admin password hash generate करायला
    // Login झाल्यावर हा endpoint काढून टाका!
    @GetMapping("/hash-test")
    public String hashTest() {
        return passwordEncoder.encode("Admin@123456");
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new ApiResponse(false, "Unauthorized", null));
        }

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        String currentPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        return ResponseEntity.ok(authService.changePassword(username, currentPassword, newPassword));
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<ApiResponse> deleteAccount(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new ApiResponse(false, "Unauthorized", null));
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        return ResponseEntity.ok(authService.deleteAccount(username));
    }
}