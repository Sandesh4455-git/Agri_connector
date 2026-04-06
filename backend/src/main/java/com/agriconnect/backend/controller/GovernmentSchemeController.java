package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.service.GovernmentSchemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schemes")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class GovernmentSchemeController {

    private final GovernmentSchemeService schemeService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllSchemes() {
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(schemeService.getByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(schemeService.getSchemeById(id));
    }
}