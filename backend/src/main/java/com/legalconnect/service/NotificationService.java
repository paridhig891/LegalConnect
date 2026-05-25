package com.legalconnect.service;

import com.legalconnect.entity.Case;
import com.legalconnect.entity.Notification;
import com.legalconnect.entity.User;
import com.legalconnect.repository.NotificationRepository;
import com.legalconnect.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void send(int userId, String title, String message, String type, Case relatedCase) {
        User user = userRepository.getReferenceById(userId);
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setRelatedCase(relatedCase);
        notificationRepository.save(n);
    }

    public void send(int userId, String title, String message, String type) {
        send(userId, title, message, type, null);
    }
}
