package com.legalconnect.repository;

import com.legalconnect.entity.CaseMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CaseMessageRepository extends JpaRepository<CaseMessage, Integer> {

    @Query("""
        SELECT m FROM CaseMessage m
        JOIN FETCH m.sender
        WHERE m.aCase.caseId = :caseId
        ORDER BY m.createdAt ASC
        """)
    List<CaseMessage> findByCaseIdOrdered(int caseId);


    @Query("""
        SELECT COUNT(m) FROM CaseMessage m
        WHERE m.aCase.caseId = :caseId
          AND m.isRead = false
          AND m.sender.userId <> :viewerUserId
        """)
    long countUnread(int caseId, int viewerUserId);

    @Modifying
    @Query("""
        UPDATE CaseMessage m
        SET m.isRead = true
        WHERE m.aCase.caseId = :caseId
          AND m.sender.userId <> :readerUserId
        """)
    void markAllReadInCase(int caseId, int readerUserId);
}
