package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.GovernmentScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GovernmentSchemeRepository extends JpaRepository<GovernmentScheme, Long> {
    List<GovernmentScheme> findByCategory(String category);

    List<GovernmentScheme> findByStatus(String status);
}