package com.agriconnect.backend.controller;

import com.agriconnect.backend.config.JwtUtil;
import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.model.CropRequest;
import com.agriconnect.backend.model.Deal;
import com.agriconnect.backend.model.User;
import com.agriconnect.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DashboardController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CropRepository cropRepository;
    private final CropRequestRepository requestRepository;
    private final DealRepository dealRepository;

    private String getUsername(String authHeader) {
        return jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
    }

    @GetMapping("/farmer")
    public ResponseEntity<ApiResponse> getFarmerDashboard(
            @RequestHeader("Authorization") String auth) {

        String username = getUsername(auth);
        User farmer = userRepository.findByUsername(username).orElse(null);
        if (farmer == null)
            return ResponseEntity.ok(new ApiResponse(false, "User not found"));

        // Crops
        var crops = cropRepository.findByFarmer(farmer);
        int totalCrops = crops.size();

        // Requests
        var requests = requestRepository.findByFarmer(farmer);
        long pendingRequests = requests.stream()
                .filter(r -> r.getStatus() == CropRequest.RequestStatus.PENDING)
                .count();

        // Deals
        var deals = dealRepository.findByFarmer(farmer);
        long activeDeals = deals.stream()
                .filter(d -> d.getStatus() == Deal.DealStatus.ACTIVE)
                .count();

        // Revenue from completed deals
        double totalRevenue = deals.stream()
                .filter(d -> d.getStatus() == Deal.DealStatus.COMPLETED)
                .mapToDouble(d -> d.getTotalAmount() != null ? d.getTotalAmount() : 0)
                .sum();

        // Unique buyers
        long uniqueBuyers = deals.stream()
                .map(d -> d.getDealer().getId())
                .distinct()
                .count();

        // Recent activity — last 5 requests + deals combined
        List<Map<String, Object>> recentActivity = requests.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(3)
                .map(r -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("action", "New request from " + r.getDealer().getName()
                            + " for " + r.getCrop().getName());
                    item.put("time", r.getCreatedAt().toString());
                    item.put("status", r.getStatus().name().toLowerCase());
                    return item;
                })
                .collect(Collectors.toList());

        // Add recent deals to activity
        deals.stream()
                .sorted((a, b) -> b.getDealDate().compareTo(a.getDealDate()))
                .limit(2)
                .forEach(d -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("action", "Deal created with " + d.getDealer().getName()
                            + " for " + d.getCrop().getName());
                    item.put("time", d.getDealDate().toString());
                    item.put("status", d.getStatus().name().toLowerCase());
                    recentActivity.add(item);
                });

        // Build response
        Map<String, Object> data = new HashMap<>();
        data.put("totalCrops", totalCrops);
        data.put("pendingRequests", pendingRequests);
        data.put("activeDeals", activeDeals);
        data.put("totalRevenue", totalRevenue);
        data.put("uniqueBuyers", uniqueBuyers);
        data.put("recentActivity", recentActivity);

        return ResponseEntity.ok(new ApiResponse(true, "Dashboard data fetched", data));
    }
}