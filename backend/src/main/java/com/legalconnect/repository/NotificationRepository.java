package com.legalconnect.repository;

import com.legalconnect.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    @Query("""
        SELECT n FROM Notification n
        WHERE n.user.userId = :userId
        ORDER BY n.createdAt DESC
        """)
    List<Notification> findByUserIdOrdered(int userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.userId = :userId AND n.isRead = false")
    void markAllReadForUser(int userId);
}
