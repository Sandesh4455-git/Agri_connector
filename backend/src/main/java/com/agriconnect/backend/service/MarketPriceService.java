package com.agriconnect.backend.service;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.model.MarketPrice;
import com.agriconnect.backend.repository.MarketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketPriceService implements CommandLineRunner {

        private final MarketPriceRepository marketPriceRepository;
        private final GovernmentSchemeService schemeService;

        // Runs AFTER tables are created
        @Override
        public void run(String... args) {
                try {
                        if (marketPriceRepository.count() == 0) {
                                List<MarketPrice> defaults = new ArrayList<>(List.of(
                                                createPrice("Wheat", "Grains", 45.0, 2.5, "up", "kg", "Mumbai APMC",
                                                                "Maharashtra", "High",
                                                                "Stable ↗️"),
                                                createPrice("Rice", "Grains", 65.0, -1.2, "down", "kg", "Delhi Mandi",
                                                                "Delhi", "Medium",
                                                                "Rising ↗️"),
                                                createPrice("Tomato", "Vegetables", 35.0, 5.8, "up", "kg",
                                                                "Pune Market", "Maharashtra",
                                                                "Very High", "High Demand ↗️"),
                                                createPrice("Potato", "Vegetables", 25.0, 0.0, "stable", "kg",
                                                                "Agra Market", "Uttar Pradesh",
                                                                "Medium", "Stable →"),
                                                createPrice("Cotton", "Fiber", 120.0, 8.3, "up", "kg", "Gujarat Market",
                                                                "Gujarat", "High",
                                                                "Bullish ↗️"),
                                                createPrice("Soybean", "Oilseeds", 55.0, -2.1, "down", "kg",
                                                                "Indore APMC", "Madhya Pradesh",
                                                                "Low", "Declining ↘️"),
                                                createPrice("Sugarcane", "Cash Crops", 320.0, 3.7, "up", "quintal",
                                                                "UP Market",
                                                                "Uttar Pradesh", "Medium", "Seasonal ↗️"),
                                                createPrice("Maize", "Grains", 28.0, 1.9, "up", "kg", "Karnataka APMC",
                                                                "Karnataka", "High",
                                                                "Growing ↗️")));
                                marketPriceRepository.saveAll(defaults);
                                System.out.println("✅ Default market prices inserted!");
                        }
                        schemeService.initDefaultSchemes();
                } catch (Exception e) {
                        System.err.println("⚠️ Could not init prices: " + e.getMessage());
                }
        }

        private MarketPrice createPrice(String crop, String category, Double price,
                        Double change, String trend, String unit, String market,
                        String region, String demand, String prediction) {
                MarketPrice mp = new MarketPrice();
                mp.setCrop(crop);
                mp.setCategory(category);
                mp.setCurrentPrice(price);
                mp.setChange(change);
                mp.setTrend(trend);
                mp.setUnit(unit);
                mp.setMarket(market);
                mp.setRegion(region);
                mp.setDemand(demand);
                mp.setPrediction(prediction);
                return mp;
        }

        public ApiResponse getAllPrices() {
                return new ApiResponse(true, "Prices fetched", marketPriceRepository.findAll());
        }

        public ApiResponse refreshPrices() {
                List<MarketPrice> prices = marketPriceRepository.findAll();
                prices.forEach(p -> {
                        double randomChange = (Math.random() * 6) - 3;
                        p.setCurrentPrice((double) Math.max(10,
                                        Math.round(p.getCurrentPrice() * (1 + randomChange / 100))));
                        p.setChange(Math.round((p.getChange() + (Math.random() * 0.4 - 0.2)) * 10.0) / 10.0);
                        p.setTrend(p.getChange() > 0 ? "up" : p.getChange() < 0 ? "down" : "stable");
                        p.setUpdatedAt(java.time.LocalDateTime.now());
                });
                marketPriceRepository.saveAll(prices);
                return new ApiResponse(true, "Prices refreshed", prices);
        }
}