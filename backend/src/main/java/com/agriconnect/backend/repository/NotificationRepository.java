package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // All notifications for a user, newest first
    List<Notification> findByUsernameOrderByCreatedAtDesc(String username);

    // Count unread for a user
    long countByUsernameAndReadFalse(String username);

    long countByUsername(String username);

    // Find specific notification owned by user (security check)
    Optional<Notification> findByIdAndUsername(Long id, String username);

    // Mark all unread → read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.username = :username AND n.read = false")
    int markAllReadByUsername(String username);
}