package com.agriconnect.backend.controller;

import com.agriconnect.backend.config.JwtUtil;
import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.dto.UpdateProfileRequest;
import com.agriconnect.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final JwtUtil jwtUtil;

    private String getUsername(String authHeader) {
        return jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getProfile(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(profileService.getProfile(getUsername(auth)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse> updateProfile(
            @RequestHeader("Authorization") String auth,
            @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(profileService.updateProfile(getUsername(auth), req));
    }
}