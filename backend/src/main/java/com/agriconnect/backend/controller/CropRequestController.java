package com.agriconnect.backend.controller;

import com.agriconnect.backend.config.JwtUtil;
import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.dto.CropRequestDto;
import com.agriconnect.backend.service.CropRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CropRequestController {

    private final CropRequestService requestService;
    private final JwtUtil jwtUtil;

    private String getUsername(String authHeader) {
        return jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
    }

    // ── FARMER ENDPOINTS ──────────────────────────────────────────────────

    @GetMapping("/farmer")
    public ResponseEntity<ApiResponse> getRequestsForFarmer(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(requestService.getRequestsForFarmer(getUsername(auth)));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse> accept(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(requestService.acceptRequest(getUsername(auth), id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse> reject(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(requestService.rejectRequest(getUsername(auth), id));
    }

    @PutMapping("/{id}/negotiate")
    public ResponseEntity<ApiResponse> negotiate(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id,
            @RequestParam Double counterPrice) {
        return ResponseEntity.ok(requestService.negotiateRequest(getUsername(auth), id, counterPrice));
    }

    // ── DEALER ENDPOINTS ──────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse> sendRequest(
            @RequestHeader("Authorization") String auth,
            @RequestBody CropRequestDto dto) {
        return ResponseEntity.ok(requestService.sendRequest(getUsername(auth), dto));
    }

    @GetMapping("/dealer")
    public ResponseEntity<ApiResponse> getRequestsByDealer(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(requestService.getRequestsByDealer(getUsername(auth)));
    }

    @PutMapping("/{id}/dealer-accept")
    public ResponseEntity<ApiResponse> dealerAcceptCounter(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(requestService.dealerAcceptCounter(getUsername(auth), id));
    }

    @PutMapping("/{id}/dealer-counter")
    public ResponseEntity<ApiResponse> dealerCounter(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id,
            @RequestParam Double newPrice) {
        return ResponseEntity.ok(requestService.dealerCounterOffer(getUsername(auth), id, newPrice));
    }

    @PutMapping("/{id}/dealer-cancel")
    public ResponseEntity<ApiResponse> dealerCancel(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(requestService.dealerCancelRequest(getUsername(auth), id));
    }

    // ── CUSTOMER ENDPOINTS ✅ NEW ─────────────────────────────────────────

    // Customer views their sent requests
    @GetMapping("/customer")
    public ResponseEntity<ApiResponse> getRequestsByCustomer(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(requestService.getRequestsByCustomer(getUsername(auth)));
    }

    // Customer sends a new request
    @PostMapping("/customer")
    public ResponseEntity<ApiResponse> sendRequestByCustomer(
            @RequestHeader("Authorization") String auth,
            @RequestBody CropRequestDto dto) {
        return ResponseEntity.ok(requestService.sendRequest(getUsername(auth), dto));
    }

    // Customer cancels their request
    @PutMapping("/{id}/customer-cancel")
    public ResponseEntity<ApiResponse> customerCancel(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(requestService.customerCancelRequest(getUsername(auth), id));
    }
}