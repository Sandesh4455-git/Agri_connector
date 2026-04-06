package com.agriconnect.backend.controller;

import com.agriconnect.backend.config.JwtUtil; // ← your existing JwtUtil location
import com.agriconnect.backend.dto.ApiResponse; // ← your existing ApiResponse
import com.agriconnect.backend.model.Notification;
import com.agriconnect.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173") // ← same as your other controllers
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    // ── Extract username from Bearer token (same pattern as your other
    // controllers) ──
    private String getUsername(String authHeader) {
        return jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
    }

    // ── GET /api/notifications ─────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse> getAll(
            @RequestHeader("Authorization") String auth) {
        String username = getUsername(auth);
        return ResponseEntity.ok(notificationService.getAll(username));
    }

    // ── PUT /api/notifications/{id}/read ──────────────────────────────────
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String auth) {
        String username = getUsername(auth);
        return ResponseEntity.ok(notificationService.markAsRead(id, username));
    }

    // ── PUT /api/notifications/read-all ───────────────────────────────────
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(
            @RequestHeader("Authorization") String auth) {
        String username = getUsername(auth);
        return ResponseEntity.ok(notificationService.markAllAsRead(username));
    }

    // ── DELETE /api/notifications/{id} ────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String auth) {
        String username = getUsername(auth);
        return ResponseEntity.ok(notificationService.delete(id, username));
    }

    // ── POST /api/notifications (admin / other services) ──────────────────
    @PostMapping
    public ResponseEntity<ApiResponse> create(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String auth) {
        // Admin can target any username, or default to self
        String targetUser = body.getOrDefault("username", getUsername(auth));
        notificationService.create(
                targetUser,
                Notification.NotificationType.valueOf(body.get("type")),
                body.get("title"),
                body.get("message"),
                Notification.Priority.valueOf(body.getOrDefault("priority", "MEDIUM")));
        return ResponseEntity.ok(new ApiResponse(true, "Notification created"));
    }
}