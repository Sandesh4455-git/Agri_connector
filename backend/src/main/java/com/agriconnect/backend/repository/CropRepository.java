package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.Crop;
import com.agriconnect.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findByFarmer(User farmer);

    List<Crop> findByAvailableTrue();

    List<Crop> findByNameContainingIgnoreCase(String name);

    List<Crop> findByCity(String city);
}