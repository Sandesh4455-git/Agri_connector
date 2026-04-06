package com.agriconnect.backend.controller;

import com.agriconnect.backend.config.JwtUtil;
import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.dto.CropRequest;
import com.agriconnect.backend.service.CropService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/crops")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CropController {

        private final CropService cropService;
        private final JwtUtil jwtUtil;

        private String getUsernameFromToken(String authHeader) {
                return jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        }

        // GET /api/crops/my — farmer's own crops only
        @GetMapping("/my")
        public ResponseEntity<ApiResponse> getMyCrops(
                        @RequestHeader("Authorization") String authHeader) {
                String username = getUsernameFromToken(authHeader);
                return ResponseEntity.ok(cropService.getMyCrops(username));
        }

        // GET /api/crops — all crops (dealer marketplace + farmer overview)
        @GetMapping
        public ResponseEntity<ApiResponse> getAllCropsAuth(
                        @RequestHeader("Authorization") String authHeader) {
                return ResponseEntity.ok(cropService.getAllCrops());
        }

        // GET /api/crops/all — all crops (public, no auth needed)
        @GetMapping("/all")
        public ResponseEntity<ApiResponse> getAllCrops() {
                return ResponseEntity.ok(cropService.getAllCrops());
        }

        // ✅ NEW — GET /api/crops/available
        // Customer BrowseProducts page हे call करतो
        // Public endpoint — SecurityConfig मध्ये permitAll() आहे
        // Optional filters: ?category=Grains&search=wheat&city=Pune
        @GetMapping("/available")
        public ResponseEntity<ApiResponse> getAvailableCrops(
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) String search,
                        @RequestParam(required = false) String city) {
                return ResponseEntity.ok(cropService.getAvailableCrops(category, search, city));
        }

        // POST /api/crops — farmer adds new crop
        @PostMapping
        public ResponseEntity<ApiResponse> addCrop(
                        @RequestHeader("Authorization") String authHeader,
                        @RequestBody CropRequest req) {
                String username = getUsernameFromToken(authHeader);
                return ResponseEntity.ok(cropService.addCrop(username, req));
        }

        // PUT /api/crops/{id} — farmer updates crop
        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse> updateCrop(
                        @RequestHeader("Authorization") String authHeader,
                        @PathVariable Long id,
                        @RequestBody CropRequest req) {
                String username = getUsernameFromToken(authHeader);
                return ResponseEntity.ok(cropService.updateCrop(username, id, req));
        }

        // DELETE /api/crops/{id} — farmer deletes crop
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse> deleteCrop(
                        @RequestHeader("Authorization") String authHeader,
                        @PathVariable Long id) {
                String username = getUsernameFromToken(authHeader);
                return ResponseEntity.ok(cropService.deleteCrop(username, id));
        }
}