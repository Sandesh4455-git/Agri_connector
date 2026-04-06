package com.agriconnect.backend.dto;

import com.agriconnect.backend.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

// All Notification-related DTOs in one file (same style as existing project)

public class NotificationDto {

    // ── Notification List (what the frontend calls GET /api/notifications) ──
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationListData {
        private List<NotificationResponse> notifications;
        private long unreadCount;
        private int totalCount;
    }

    // ── Single Notification Response ───────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        private Long id;
        private String type;
        private String title;
        private String message;
        private String priority;
        private boolean read;
        private LocalDateTime createdAt;

        public static NotificationResponse from(Notification n) {
            return NotificationResponse.builder()
                    .id(n.getId())
                    .type(n.getType().name())
                    .title(n.getTitle())
                    .message(n.getMessage())
                    .priority(n.getPriority().name())
                    .read(n.isRead())
                    .createdAt(n.getCreatedAt())
                    .build();
        }
    }

    // ── Create Notification Request (for internal/admin use) ───────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateNotificationRequest {
        private String targetUsername; // which farmer to notify
        private Notification.NotificationType type;
        private String title;
        private String message;
        private Notification.Priority priority;
    }
}