package com.legalconnect.controller;

import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.User;
import com.legalconnect.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal User user) {
        List<NotificationResponse> result = notificationRepository
                .findByUserIdOrdered(user.getUserId())
                .stream()
                .map(n -> new NotificationResponse(
                        n.getNotificationId(),
                        n.getTitle(),
                        n.getMessage(),
                        n.getType(),
                        n.getRelatedCase() != null ? n.getRelatedCase().getCaseId() : null,
                        n.isRead(),
                        n.getCreatedAt()
                ))
                .toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/read")
    @Transactional
    public ResponseEntity<SuccessResponse> markAllRead(@AuthenticationPrincipal User user) {
        notificationRepository.markAllReadForUser(user.getUserId());
        return ResponseEntity.ok(SuccessResponse.ok("All notifications marked as read."));
    }
}
