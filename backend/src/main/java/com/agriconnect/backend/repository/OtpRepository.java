package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.OtpStore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpStore, Long> {
    Optional<OtpStore> findByPhone(String phone);

    void deleteByPhone(String phone);
}