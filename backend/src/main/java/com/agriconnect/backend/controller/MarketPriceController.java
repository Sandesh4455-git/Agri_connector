package com.agriconnect.backend.controller;

import com.agriconnect.backend.model.MarketPrice;
import com.agriconnect.backend.repository.MarketPriceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/market-prices")
@CrossOrigin(origins = "http://localhost:5173")
public class MarketPriceController {

        @Value("${datagov.api.key}")
        private String apiKey;

        @Autowired
        private MarketPriceRepository marketPriceRepository;

        private static final String RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24";
        private static final String BASE_URL = "https://api.data.gov.in/resource/" + RESOURCE_ID;

        // ─────────────────────────────────────────────────────────────
        // GET /api/market-prices?state=Maharashtra&limit=200
        // Tries live API first → falls back to local DB on timeout
        // ─────────────────────────────────────────────────────────────
        @GetMapping
        public ResponseEntity<?> getMarketPrices(
                        @RequestParam(defaultValue = "Maharashtra") String state,
                        @RequestParam(defaultValue = "") String commodity,
                        @RequestParam(defaultValue = "200") int limit) {
                try {
                        String encodedState = java.net.URLEncoder.encode(state, "UTF-8");
                        String url = BASE_URL
                                        + "?api-key=" + apiKey
                                        + "&format=json"
                                        + "&limit=" + limit
                                        + "&filters%5BState%5D=" + encodedState;

                        System.out.println("Trying live AGMARKNET API...");

                        HttpClient client = HttpClient.newBuilder()
                                        .connectTimeout(Duration.ofSeconds(8))
                                        .build();

                        HttpResponse<String> response = client.send(
                                        HttpRequest.newBuilder()
                                                        .uri(URI.create(url))
                                                        .timeout(Duration.ofSeconds(10))
                                                        .header("Accept", "application/json")
                                                        .GET().build(),
                                        HttpResponse.BodyHandlers.ofString());

                        if (response.statusCode() == 200
                                        && response.body().contains("\"records\"")
                                        && !response.body().contains("\"records\":[]")) {
                                System.out.println("✅ Live API data returned!");
                                return ResponseEntity.ok()
                                                .header("Content-Type", "application/json")
                                                .body(response.body());
                        }

                        System.out.println("⚠️ Live API empty — using local DB fallback");

                } catch (Exception e) {
                        System.out.println("⚠️ Live API unreachable: " + e.getMessage() + " — using local DB fallback");
                }

                // FALLBACK: local DB data in AGMARKNET-compatible JSON format
                return ResponseEntity.ok()
                                .header("Content-Type", "application/json")
                                .body(buildFallbackJson(state, commodity, limit));
        }

        // Converts local DB rows → AGMARKNET JSON so frontend works unchanged
        private String buildFallbackJson(String state, String commodity, int limit) {
                List<MarketPrice> prices = marketPriceRepository.findAll();

                if (commodity != null && !commodity.isBlank()) {
                        final String c = commodity.toLowerCase();
                        prices = prices.stream()
                                        .filter(p -> p.getCrop().toLowerCase().contains(c))
                                        .collect(Collectors.toList());
                }

                if (prices.size() > limit)
                        prices = prices.subList(0, limit);

                String today = java.time.LocalDate.now().toString();

                StringBuilder records = new StringBuilder();
                for (int i = 0; i < prices.size(); i++) {
                        MarketPrice p = prices.get(i);
                        double modal = p.getCurrentPrice() != null ? p.getCurrentPrice() : 0;
                        double min = Math.max(0, modal * 0.90);
                        double max = modal * 1.10;

                        if (i > 0)
                                records.append(",");
                        records.append("{")
                                        .append("\"State\":\"").append(p.getRegion() != null ? p.getRegion() : state)
                                        .append("\",")
                                        .append("\"District\":\"")
                                        .append(p.getMarket() != null ? p.getMarket() : "Local").append("\",")
                                        .append("\"Market\":\"")
                                        .append(p.getMarket() != null ? p.getMarket() : "Local APMC").append("\",")
                                        .append("\"Commodity\":\"").append(p.getCrop() != null ? p.getCrop() : "")
                                        .append("\",")
                                        .append("\"Variety\":\"")
                                        .append(p.getCategory() != null ? p.getCategory() : "General").append("\",")
                                        .append("\"Grade\":\"").append(p.getDemand() != null ? p.getDemand() : "A")
                                        .append("\",")
                                        .append("\"Arrival_Date\":\"").append(today).append("\",")
                                        .append("\"Min_Price\":\"").append(String.format("%.0f", min)).append("\",")
                                        .append("\"Max_Price\":\"").append(String.format("%.0f", max)).append("\",")
                                        .append("\"Modal_Price\":\"").append(String.format("%.0f", modal)).append("\"")
                                        .append("}");
                }

                return "{\"records\":[" + records + "],"
                                + "\"total\":" + prices.size() + ","
                                + "\"count\":" + prices.size() + ","
                                + "\"source\":\"local-db-fallback\"}";
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/market-prices/debug
        // ─────────────────────────────────────────────────────────────
        @GetMapping("/debug")
        public ResponseEntity<?> debug() {
                long dbCount = marketPriceRepository.count();
                try {
                        String url = BASE_URL + "?api-key=" + apiKey + "&format=json&limit=2";
                        HttpClient client = HttpClient.newBuilder()
                                        .connectTimeout(Duration.ofSeconds(8)).build();
                        HttpResponse<String> response = client.send(
                                        HttpRequest.newBuilder()
                                                        .uri(URI.create(url))
                                                        .timeout(Duration.ofSeconds(10))
                                                        .GET().build(),
                                        HttpResponse.BodyHandlers.ofString());
                        return ResponseEntity.ok(Map.of(
                                        "live_api_status", response.statusCode(),
                                        "live_api_body",
                                        response.body().substring(0, Math.min(400, response.body().length())),
                                        "local_db_count", dbCount,
                                        "mode", response.statusCode() == 200 ? "LIVE" : "FALLBACK"));
                } catch (Exception e) {
                        return ResponseEntity.ok(Map.of(
                                        "live_api_status", "TIMEOUT",
                                        "live_api_error", e.getMessage(),
                                        "local_db_count", dbCount,
                                        "mode", "FALLBACK — showing local DB data",
                                        "fix",
                                        "api.data.gov.in is blocked on your network. Change WiFi or use mobile hotspot."));
                }
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/market-prices/states
        // ─────────────────────────────────────────────────────────────
        @GetMapping("/states")
        public ResponseEntity<?> getStates() {
                return ResponseEntity.ok(Map.of("success", true, "data", Arrays.asList(
                                "Maharashtra", "Gujarat", "Punjab", "Haryana", "Uttar Pradesh",
                                "Madhya Pradesh", "Rajasthan", "Karnataka", "Andhra Pradesh",
                                "Tamil Nadu", "West Bengal", "Bihar")));
        }
}