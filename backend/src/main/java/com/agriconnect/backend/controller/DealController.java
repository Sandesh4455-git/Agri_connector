package com.agriconnect.backend.controller;

import com.agriconnect.backend.config.JwtUtil;
import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.service.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deals")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;
    private final JwtUtil jwtUtil;

    private String getUsername(String authHeader) {
        return jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
    }

    @GetMapping("/farmer")
    public ResponseEntity<ApiResponse> getFarmerDeals(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(dealService.getFarmerDeals(getUsername(auth)));
    }

    @GetMapping("/dealer")
    public ResponseEntity<ApiResponse> getDealerDeals(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(dealService.getDealerDeals(getUsername(auth)));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse> completeDeal(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(dealService.completeDeal(getUsername(auth), id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelDeal(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(dealService.cancelDeal(getUsername(auth), id));
    }
}