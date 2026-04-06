package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ── Login साठी ───────────────────────────────────────────────────
    Optional<User> findByUsername(String username);

    // ── Forgot Password साठी ─────────────────────────────────────────
    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    // ── Registration validation साठी ─────────────────────────────────
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    void deleteByUsername(String username);
}