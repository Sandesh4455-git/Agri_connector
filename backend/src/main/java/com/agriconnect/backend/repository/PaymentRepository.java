package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByFromUsernameOrderByCreatedAtDesc(String username);

    List<Payment> findByToUsernameOrderByCreatedAtDesc(String username);

    Optional<Payment> findByPayuTxnId(String txnId); // renamed from findByRazorpayOrderId

    List<Payment> findByFromUsernameOrToUsernameOrderByCreatedAtDesc(String from, String to);
}