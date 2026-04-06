package com.agriconnect.backend.service;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.dto.UpdateProfileRequest;
import com.agriconnect.backend.model.User;
import com.agriconnect.backend.repository.CropRepository;
import com.agriconnect.backend.repository.DealRepository;
import com.agriconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final CropRepository cropRepository;
    private final DealRepository dealRepository;

    public ApiResponse getProfile(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null)
            return new ApiResponse(false, "User not found");

        var crops = cropRepository.findByFarmer(user);
        var deals = dealRepository.findByFarmer(user);

        long completedDeals = deals.stream()
                .filter(d -> d.getStatus().name().equals("COMPLETED")).count();

        double totalRevenue = deals.stream()
                .filter(d -> d.getStatus().name().equals("COMPLETED"))
                .mapToDouble(d -> d.getTotalAmount() != null ? d.getTotalAmount() : 0)
                .sum();

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("name", user.getName());
        data.put("username", user.getUsername());
        data.put("phone", user.getPhone());
        data.put("email", user.getEmail() != null ? user.getEmail() : "");
        data.put("city", user.getCity() != null ? user.getCity() : "");
        data.put("state", user.getState() != null ? user.getState() : "");
        data.put("role", user.getRole().name());
        data.put("verified", user.isVerified());
        data.put("farmSize", user.getFarmSize() != null ? user.getFarmSize() : "");
        data.put("experience", user.getExperience() != null ? user.getExperience() : "");
        data.put("address", user.getAddress() != null ? user.getAddress() : "");
        data.put("joinDate", user.getCreatedAt());
        data.put("totalCrops", crops.size());
        data.put("completedDeals", completedDeals);
        data.put("totalRevenue", totalRevenue);

        return new ApiResponse(true, "Profile fetched", data);
    }

    public ApiResponse updateProfile(String username, UpdateProfileRequest req) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null)
            return new ApiResponse(false, "User not found");

        if (req.getName() != null && !req.getName().isEmpty())
            user.setName(req.getName());
        if (req.getEmail() != null)
            user.setEmail(req.getEmail());
        if (req.getCity() != null)
            user.setCity(req.getCity());
        if (req.getState() != null)
            user.setState(req.getState());
        if (req.getFarmSize() != null)
            user.setFarmSize(req.getFarmSize());
        if (req.getExperience() != null)
            user.setExperience(req.getExperience());
        if (req.getAddress() != null)
            user.setAddress(req.getAddress());

        userRepository.save(user);
        return new ApiResponse(true, "Profile updated successfully", user);
    }
}