package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.Deal;
import com.agriconnect.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DealRepository extends JpaRepository<Deal, Long> {
    List<Deal> findByFarmer(User farmer);

    List<Deal> findByDealer(User dealer);

    List<Deal> findByFarmerAndStatus(User farmer, Deal.DealStatus status);
}