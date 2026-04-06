package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.CropRequest;
import com.agriconnect.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CropRequestRepository extends JpaRepository<CropRequest, Long> {
    List<CropRequest> findByFarmer(User farmer);

    List<CropRequest> findByDealer(User dealer);

    List<CropRequest> findByFarmerAndStatus(User farmer, CropRequest.RequestStatus status);
}