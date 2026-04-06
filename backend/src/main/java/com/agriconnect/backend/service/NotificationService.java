package com.agriconnect.backend.service;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.model.Notification;
import com.agriconnect.backend.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    // ── Get all notifications for a user ───────────────────────────────────
    public ApiResponse getAll(String username) {
        List<Notification> list = repo.findByUsernameOrderByCreatedAtDesc(username);
        long unread = repo.countByUsernameAndReadFalse(username);

        // Build response list as maps (matches your ApiResponse pattern)
        List<Map<String, Object>> notifications = list.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("type", n.getType().name());
            map.put("title", n.getTitle());
            map.put("message", n.getMessage());
            map.put("priority", n.getPriority().name());
            map.put("read", n.isRead());
            map.put("createdAt", n.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("notifications", notifications);
        data.put("unreadCount", unread);
        data.put("totalCount", list.size());

        return new ApiResponse(true, "Notifications fetched", data);
    }

    // ── Mark one notification as read ──────────────────────────────────────
    @Transactional
    public ApiResponse markAsRead(Long id, String username) {
        return repo.findByIdAndUsername(id, username).map(n -> {
            n.setRead(true);
            repo.save(n);
            return new ApiResponse(true, "Marked as read");
        }).orElse(new ApiResponse(false, "Notification not found"));
    }

    // ── Mark all notifications as read ─────────────────────────────────────
    @Transactional
    public ApiResponse markAllAsRead(String username) {
        int count = repo.markAllReadByUsername(username);
        return new ApiResponse(true, "Marked " + count + " notifications as read");
    }

    // ── Delete a notification ──────────────────────────────────────────────
    @Transactional
    public ApiResponse delete(Long id, String username) {
        return repo.findByIdAndUsername(id, username).map(n -> {
            repo.delete(n);
            return new ApiResponse(true, "Notification deleted");
        }).orElse(new ApiResponse(false, "Notification not found"));
    }

    // ── Create a notification (called by other services) ───────────────────
    @Transactional
    public Notification create(String username,
            Notification.NotificationType type,
            String title,
            String message,
            Notification.Priority priority) {
        Notification n = Notification.builder()
                .username(username)
                .type(type)
                .title(title)
                .message(message)
                .priority(priority)
                .read(false)
                .build();
        return repo.save(n);
    }

    // ── Seed welcome notifications for brand-new users ─────────────────────
    @Transactional
    public void seedWelcomeNotifications(String username) {
        // Only seed if user has no notifications yet
        if (repo.countByUsernameAndReadFalse(username) > 0)
            return;

        List<Object[]> seeds = List.of(
                new Object[] { "ORDER", "HIGH", "Welcome to AgriConnect! 🎉",
                        "Your account is ready. Start listing your crops to receive orders from buyers." },
                new Object[] { "SCHEME", "MEDIUM", "PM-KISAN Installment Available",
                        "14th installment of PM-KISAN (₹2,000) released. Check your Aadhaar-linked bank." },
                new Object[] { "PRICE", "MEDIUM", "Today's Mandi Prices Updated",
                        "Wheat ₹46/kg ↑, Tomato ₹35/kg ↑, Rice ₹64/kg →. Check Market section for details." },
                new Object[] { "SYSTEM", "LOW", "Complete Your Profile",
                        "Add your bank account details to receive payments directly from buyers." });

        seeds.forEach(s -> create(
                username,
                Notification.NotificationType.valueOf((String) s[0]),
                (String) s[2],
                (String) s[3],
                Notification.Priority.valueOf((String) s[1])));
    }
}