package com.agriconnect.backend.service;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.dto.CropRequest;
import com.agriconnect.backend.model.Crop;
import com.agriconnect.backend.model.User;
import com.agriconnect.backend.repository.CropRepository;
import com.agriconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CropService {

    private final CropRepository cropRepository;
    private final UserRepository userRepository;

    // Get all crops for a farmer
    public ApiResponse getMyCrops(String username) {
        User farmer = userRepository.findByUsername(username).orElse(null);
        if (farmer == null)
            return new ApiResponse(false, "User not found");

        List<Crop> crops = cropRepository.findByFarmer(farmer);
        return new ApiResponse(true, "Crops fetched", crops);
    }

    // Add new crop
    public ApiResponse addCrop(String username, CropRequest req) {
        User farmer = userRepository.findByUsername(username).orElse(null);
        if (farmer == null)
            return new ApiResponse(false, "User not found");

        Crop crop = new Crop();
        crop.setFarmer(farmer);
        crop.setName(req.getName());
        crop.setCategory(req.getCategory());
        crop.setQuantity(req.getQuantity());
        crop.setUnit(req.getUnit());
        crop.setPricePerUnit(req.getPricePerUnit());
        crop.setCity(req.getCity());
        crop.setState(req.getState());
        crop.setDescription(req.getDescription());
        crop.setImageUrl(req.getImageUrl());

        cropRepository.save(crop);
        return new ApiResponse(true, "Crop added successfully", crop);
    }

    // Update crop
    public ApiResponse updateCrop(String username, Long cropId, CropRequest req) {
        Crop crop = cropRepository.findById(cropId).orElse(null);
        if (crop == null)
            return new ApiResponse(false, "Crop not found");
        if (!crop.getFarmer().getUsername().equals(username)) {
            return new ApiResponse(false, "Not authorized");
        }

        crop.setName(req.getName());
        crop.setCategory(req.getCategory());
        crop.setQuantity(req.getQuantity());
        crop.setUnit(req.getUnit());
        crop.setPricePerUnit(req.getPricePerUnit());
        crop.setCity(req.getCity());
        crop.setState(req.getState());
        crop.setDescription(req.getDescription());
        crop.setUpdatedAt(LocalDateTime.now());

        cropRepository.save(crop);
        return new ApiResponse(true, "Crop updated successfully", crop);
    }

    // Delete crop
    public ApiResponse deleteCrop(String username, Long cropId) {
        Crop crop = cropRepository.findById(cropId).orElse(null);
        if (crop == null)
            return new ApiResponse(false, "Crop not found");
        if (!crop.getFarmer().getUsername().equals(username)) {
            return new ApiResponse(false, "Not authorized");
        }

        cropRepository.delete(crop);
        return new ApiResponse(true, "Crop deleted successfully");
    }

    // Get all available crops (for dealers)
    public ApiResponse getAllCrops() {
        List<Crop> crops = cropRepository.findByAvailableTrue();
        return new ApiResponse(true, "All crops fetched", crops);
    }

    public ApiResponse getAvailableCrops(String category, String search, String city) {
        var crops = cropRepository.findAll().stream()
                .filter(c -> c.isAvailable())
                .filter(c -> c.getQuantity() != null && c.getQuantity() > 0)
                .filter(c -> category == null || category.isBlank() ||
                        (c.getCategory() != null && c.getCategory().equalsIgnoreCase(category)))
                .filter(c -> search == null || search.isBlank() ||
                        c.getName().toLowerCase().contains(search.toLowerCase()))
                .filter(c -> city == null || city.isBlank() ||
                        (c.getCity() != null && c.getCity().toLowerCase().contains(city.toLowerCase())))
                .sorted((a, b) -> {
                    if (b.getCreatedAt() == null)
                        return -1;
                    if (a.getCreatedAt() == null)
                        return 1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();

        return new ApiResponse(true, "Available crops fetched", crops);
    }
}