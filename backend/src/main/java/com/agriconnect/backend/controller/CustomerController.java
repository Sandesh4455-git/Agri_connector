package com.agriconnect.backend.controller;

import com.agriconnect.backend.config.JwtUtil;
import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.dto.CropRequestDto;
import com.agriconnect.backend.service.CropRequestService;
import com.agriconnect.backend.service.PaymentService;
import com.agriconnect.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CustomerController {

    private final CropRequestService requestService;
    private final PaymentService paymentService;
    private final ProfileService profileService;
    private final JwtUtil jwtUtil;

    private String getUsername(String authHeader) {
        return jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
    }

    // ── ORDERS (same as requests for customer) ────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse> getOrders(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(requestService.getRequestsByCustomer(getUsername(auth)));
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(requestService.customerCancelRequest(getUsername(auth), id));
    }

    // ── REQUESTS ──────────────────────────────────────────────────────────

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse> getRequests(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(requestService.getRequestsByCustomer(getUsername(auth)));
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse> sendRequest(
            @RequestHeader("Authorization") String auth,
            @RequestBody CropRequestDto dto) {
        return ResponseEntity.ok(requestService.sendRequest(getUsername(auth), dto));
    }

    @PutMapping("/requests/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelRequest(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(requestService.customerCancelRequest(getUsername(auth), id));
    }

    // ── PAYMENTS ──────────────────────────────────────────────────────────

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse> getTransactions(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(paymentService.getTransactions(getUsername(auth)));
    }

    // ── PROFILE ───────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(profileService.getProfile(getUsername(auth)));
    }
}