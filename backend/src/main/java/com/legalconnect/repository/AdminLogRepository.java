package com.legalconnect.repository;

import com.legalconnect.entity.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AdminLogRepository extends JpaRepository<AdminLog, Integer> {

    @Query("""
        SELECT l FROM AdminLog l
        JOIN FETCH l.admin
        LEFT JOIN FETCH l.target
        ORDER BY l.createdAt DESC
        LIMIT 100
        """)
    List<AdminLog> findRecentLogs();
}
