package com.agriconnect.backend.controller;

import com.agriconnect.backend.config.JwtUtil;
import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.model.GovernmentScheme;
import com.agriconnect.backend.model.MarketPrice;
import com.agriconnect.backend.model.User;
import com.agriconnect.backend.repository.*;
import com.agriconnect.backend.service.PaymentExcelService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

import com.agriconnect.backend.service.PaymentExcelService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CropRepository cropRepository;
    private final DealRepository dealRepository;
    private final PaymentRepository paymentRepository;
    private final GovernmentSchemeRepository schemeRepository;
    private final MarketPriceRepository marketPriceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PaymentExcelService paymentExcelService;

    // ────────────────────────────────────────────────────
    // ADMIN LOGIN
    // ────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> adminLogin(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        var opt = userRepository.findByUsername(username);
        if (opt.isEmpty())
            return ResponseEntity.ok(new ApiResponse(false, "Invalid credentials"));
        User user = opt.get();
        if (user.getRole() != User.Role.admin)
            return ResponseEntity.ok(new ApiResponse(false, "Access denied. Admin only."));
        if (!passwordEncoder.matches(password, user.getPassword()))
            return ResponseEntity.ok(new ApiResponse(false, "Invalid credentials"));
        String token = jwtUtil.generateToken(username, "admin");
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", Map.of("username", user.getUsername(), "name", user.getName(), "role", "admin"));
        return ResponseEntity.ok(new ApiResponse(true, "Admin login successful", data));
    }

    // ────────────────────────────────────────────────────
    // SETUP ADMIN (first-time only)
    // ────────────────────────────────────────────────────
    @PostMapping("/setup")
    public ResponseEntity<ApiResponse> setupAdmin(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "admin");
        String password = body.getOrDefault("password", "Admin@123456");
        String name = body.getOrDefault("name", "System Administrator");
        if (userRepository.existsByUsername(username))
            return ResponseEntity.ok(new ApiResponse(false, "Admin already exists"));
        User admin = new User();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setName(name);
        admin.setPhone("0000000000");
        admin.setRole(User.Role.admin);
        admin.setVerified(true);
        userRepository.save(admin);
        return ResponseEntity.ok(new ApiResponse(true,
                "Admin created! Username: " + username + " | Password: " + password));
    }

    // ────────────────────────────────────────────────────
    // DASHBOARD STATS
    // ────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats() {
        List<User> allUsers = userRepository.findAll();
        long totalFarmers = allUsers.stream().filter(u -> u.getRole() == User.Role.farmer).count();
        long totalDealers = allUsers.stream().filter(u -> u.getRole() == User.Role.dealer).count();
        long totalCustomers = allUsers.stream().filter(u -> u.getRole() == User.Role.customer).count();
        long activeSchemes = schemeRepository.findByStatus("active").size();
        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == com.agriconnect.backend.model.Payment.PaymentStatus.COMPLETED)
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", allUsers.size());
        stats.put("totalFarmers", totalFarmers);
        stats.put("totalDealers", totalDealers);
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalCrops", cropRepository.count());
        stats.put("totalDeals", dealRepository.count());
        stats.put("totalPayments", paymentRepository.count());
        stats.put("totalRevenue", totalRevenue);
        stats.put("activeSchemes", activeSchemes);
        return ResponseEntity.ok(new ApiResponse(true, "Stats fetched", stats));
    }

    // ────────────────────────────────────────────────────
    // ANALYTICS
    // ────────────────────────────────────────────────────
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse> getAnalytics() {
        List<User> allUsers = userRepository.findAll();

        // Role distribution
        List<Map<String, Object>> roleData = new ArrayList<>();
        roleData.add(mkEntry("Farmers", allUsers.stream().filter(u -> u.getRole() == User.Role.farmer).count()));
        roleData.add(mkEntry("Dealers", allUsers.stream().filter(u -> u.getRole() == User.Role.dealer).count()));
        roleData.add(mkEntry("Customers", allUsers.stream().filter(u -> u.getRole() == User.Role.customer).count()));

        // Crop category distribution
        Map<String, Long> catMap = new HashMap<>();
        cropRepository.findAll().forEach(c -> {
            String cat = c.getCategory() != null ? c.getCategory() : "Other";
            catMap.merge(cat, 1L, Long::sum);
        });
        List<Map<String, Object>> cropData = new ArrayList<>();
        catMap.forEach((k, v) -> cropData.add(mkEntry(k, v)));

        // Payment status
        Map<String, Long> payStatus = new HashMap<>();
        paymentRepository.findAll().forEach(p -> {
            String s = p.getStatus() != null ? p.getStatus().name() : "UNKNOWN";
            payStatus.merge(s, 1L, Long::sum);
        });

        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == com.agriconnect.backend.model.Payment.PaymentStatus.COMPLETED)
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("roleDistribution", roleData);
        analytics.put("cropDistribution", cropData);
        analytics.put("paymentStatus", payStatus);
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("totalDeals", dealRepository.count());
        analytics.put("totalUsers", allUsers.size());
        return ResponseEntity.ok(new ApiResponse(true, "Analytics fetched", analytics));
    }

    private Map<String, Object> mkEntry(String name, long value) {
        Map<String, Object> m = new HashMap<>();
        m.put("name", name);
        m.put("value", value);
        return m;
    }

    // ────────────────────────────────────────────────────
    // USERS
    // ────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse(true, "Users fetched", userRepository.findAll()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id))
            return ResponseEntity.ok(new ApiResponse(false, "User not found"));
        userRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse(true, "User deleted"));
    }

    @PutMapping("/users/{id}/toggle-block")
    public ResponseEntity<ApiResponse> toggleBlock(@PathVariable Long id) {
        var opt = userRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.ok(new ApiResponse(false, "User not found"));
        User user = opt.get();
        user.setVerified(!user.isVerified());
        userRepository.save(user);
        return ResponseEntity.ok(new ApiResponse(true,
                user.isVerified() ? "User unblocked" : "User blocked", user));
    }

    // ────────────────────────────────────────────────────
    // CROPS & DEALS & PAYMENTS
    // ────────────────────────────────────────────────────
    @GetMapping("/crops")
    public ResponseEntity<ApiResponse> getAllCrops() {
        return ResponseEntity.ok(new ApiResponse(true, "Crops fetched", cropRepository.findAll()));
    }

    @DeleteMapping("/crops/{id}")
    public ResponseEntity<ApiResponse> deleteCrop(@PathVariable Long id) {
        if (!cropRepository.existsById(id))
            return ResponseEntity.ok(new ApiResponse(false, "Crop not found"));
        cropRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Crop deleted"));
    }

    @GetMapping("/deals")
    public ResponseEntity<ApiResponse> getAllDeals() {
        return ResponseEntity.ok(new ApiResponse(true, "Deals fetched", dealRepository.findAll()));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse> getAllPayments() {
        return ResponseEntity.ok(new ApiResponse(true, "Payments fetched", paymentRepository.findAll()));
    }

    // ────────────────────────────────────────────────────
    // SCHEMES CRUD
    // GovernmentScheme fields:
    // title, description, category, eligibility,
    // subsidy, deadline, status, officialLink,
    // fullDescription, requiredDocuments,
    // eligibilityCriteria, benefits, applicationProcess
    // ────────────────────────────────────────────────────
    @GetMapping("/schemes")
    public ResponseEntity<ApiResponse> getAllSchemes() {
        return ResponseEntity.ok(new ApiResponse(true, "Schemes fetched", schemeRepository.findAll()));
    }

    @PostMapping("/schemes")
    public ResponseEntity<ApiResponse> createScheme(@RequestBody Map<String, Object> body) {
        GovernmentScheme s = new GovernmentScheme();
        // Frontend sends "name" → map to "title"
        String title = (String) (body.get("name") != null ? body.get("name") : body.get("title"));
        s.setTitle(title);
        s.setDescription((String) body.get("description"));
        s.setCategory((String) body.getOrDefault("category", "general"));
        s.setEligibility((String) body.getOrDefault("eligibility", "All farmers"));
        // Frontend sends "budget" → map to "subsidy"
        s.setSubsidy((String) (body.get("budget") != null ? body.get("budget") : body.get("subsidy")));
        // Frontend sends "endDate" → map to "deadline"
        s.setDeadline((String) (body.get("endDate") != null ? body.get("endDate") : body.get("deadline")));
        s.setStatus((String) body.getOrDefault("status", "active"));
        s.setOfficialLink((String) body.getOrDefault("officialLink", ""));
        schemeRepository.save(s);
        return ResponseEntity.ok(new ApiResponse(true, "Scheme created", s));
    }

    @PutMapping("/schemes/{id}")
    public ResponseEntity<ApiResponse> updateScheme(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        var opt = schemeRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.ok(new ApiResponse(false, "Scheme not found"));
        GovernmentScheme s = opt.get();
        if (body.get("name") != null)
            s.setTitle((String) body.get("name"));
        if (body.get("title") != null)
            s.setTitle((String) body.get("title"));
        if (body.get("description") != null)
            s.setDescription((String) body.get("description"));
        if (body.get("category") != null)
            s.setCategory((String) body.get("category"));
        if (body.get("eligibility") != null)
            s.setEligibility((String) body.get("eligibility"));
        if (body.get("budget") != null)
            s.setSubsidy((String) body.get("budget"));
        if (body.get("subsidy") != null)
            s.setSubsidy((String) body.get("subsidy"));
        if (body.get("endDate") != null)
            s.setDeadline((String) body.get("endDate"));
        if (body.get("deadline") != null)
            s.setDeadline((String) body.get("deadline"));
        if (body.get("status") != null)
            s.setStatus((String) body.get("status"));
        if (body.get("officialLink") != null)
            s.setOfficialLink((String) body.get("officialLink"));
        schemeRepository.save(s);
        return ResponseEntity.ok(new ApiResponse(true, "Scheme updated", s));
    }

    @DeleteMapping("/schemes/{id}")
    public ResponseEntity<ApiResponse> deleteScheme(@PathVariable Long id) {
        if (!schemeRepository.existsById(id))
            return ResponseEntity.ok(new ApiResponse(false, "Scheme not found"));
        schemeRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Scheme deleted"));
    }

    // ────────────────────────────────────────────────────
    // MARKET PRICES CRUD
    // MarketPrice fields:
    // crop, category, currentPrice, change (price_change),
    // trend, unit, market, region, demand,
    // prediction, updatedAt
    // ────────────────────────────────────────────────────
    @GetMapping("/market-prices")
    public ResponseEntity<ApiResponse> getAllPrices() {
        return ResponseEntity.ok(new ApiResponse(true, "Prices fetched", marketPriceRepository.findAll()));
    }

    @PostMapping("/market-prices")
    public ResponseEntity<ApiResponse> createPrice(@RequestBody Map<String, Object> body) {
        MarketPrice p = new MarketPrice();
        p.setCrop((String) body.get("crop"));
        p.setCategory((String) body.getOrDefault("category", "general"));
        p.setMarket((String) body.get("market"));
        p.setRegion((String) body.getOrDefault("region", ""));
        p.setUnit((String) body.getOrDefault("unit", "quintal"));
        p.setTrend((String) body.getOrDefault("trend", "stable"));
        p.setDemand((String) body.getOrDefault("demand", "medium"));
        p.setPrediction((String) body.getOrDefault("prediction", ""));
        // Frontend sends "price" → map to "currentPrice"
        if (body.get("price") != null)
            p.setCurrentPrice(Double.parseDouble(body.get("price").toString()));
        if (body.get("currentPrice") != null)
            p.setCurrentPrice(Double.parseDouble(body.get("currentPrice").toString()));
        // Frontend sends "change" for price change
        if (body.get("change") != null)
            p.setChange(Double.parseDouble(body.get("change").toString()));
        p.setUpdatedAt(LocalDateTime.now());
        marketPriceRepository.save(p);
        return ResponseEntity.ok(new ApiResponse(true, "Price added", p));
    }

    @PutMapping("/market-prices/{id}")
    public ResponseEntity<ApiResponse> updatePrice(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        var opt = marketPriceRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.ok(new ApiResponse(false, "Price not found"));
        MarketPrice p = opt.get();
        if (body.get("crop") != null)
            p.setCrop((String) body.get("crop"));
        if (body.get("category") != null)
            p.setCategory((String) body.get("category"));
        if (body.get("market") != null)
            p.setMarket((String) body.get("market"));
        if (body.get("region") != null)
            p.setRegion((String) body.get("region"));
        if (body.get("unit") != null)
            p.setUnit((String) body.get("unit"));
        if (body.get("trend") != null)
            p.setTrend((String) body.get("trend"));
        if (body.get("demand") != null)
            p.setDemand((String) body.get("demand"));
        if (body.get("prediction") != null)
            p.setPrediction((String) body.get("prediction"));
        if (body.get("price") != null)
            p.setCurrentPrice(Double.parseDouble(body.get("price").toString()));
        if (body.get("currentPrice") != null)
            p.setCurrentPrice(Double.parseDouble(body.get("currentPrice").toString()));
        if (body.get("change") != null)
            p.setChange(Double.parseDouble(body.get("change").toString()));
        p.setUpdatedAt(LocalDateTime.now());
        marketPriceRepository.save(p);
        return ResponseEntity.ok(new ApiResponse(true, "Price updated", p));
    }

    @DeleteMapping("/market-prices/{id}")
    public ResponseEntity<ApiResponse> deletePrice(@PathVariable Long id) {
        if (!marketPriceRepository.existsById(id))
            return ResponseEntity.ok(new ApiResponse(false, "Price not found"));
        marketPriceRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Price deleted"));
    }

    @GetMapping("/payments/export")
    public ResponseEntity<byte[]> exportPaymentsExcel(
            @RequestHeader("Authorization") String auth) {
        try {
            byte[] excelBytes = paymentExcelService.generatePaymentReconciliationExcel();

            String filename = "AgriConnect_Payments_"
                    + java.time.LocalDate.now().toString() + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelBytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}