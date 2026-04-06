package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
    List<MarketPrice> findByRegion(String region);

    List<MarketPrice> findByCategory(String category);

    List<MarketPrice> findByCropContainingIgnoreCase(String crop);
}