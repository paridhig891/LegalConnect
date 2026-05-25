package com.legalconnect.repository;

import com.legalconnect.entity.Case;
import com.legalconnect.entity.Case.CaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CaseRepository extends JpaRepository<Case, Integer> {

    // Client: own cases ordered newest first
    @Query("SELECT c FROM Case c WHERE c.client.user.userId = :userId ORDER BY c.createdAt DESC")
    List<Case> findByClientUserId(int userId);

    // Client: detailed tracker view with lawyer info
    @Query("""
        SELECT c FROM Case c
        LEFT JOIN FETCH c.lawyer l
        LEFT JOIN FETCH l.user lu
        WHERE c.client.user.userId = :userId
        ORDER BY c.createdAt DESC
        """)
    List<Case> findByClientUserIdWithLawyer(int userId);

    // Lawyer: browse all pending cases
    List<Case> findByCaseStatusOrderByCreatedAtDesc(CaseStatus status);

    // Lawyer: own active/in_progress cases
    @Query("""
        SELECT c FROM Case c
        WHERE c.lawyer.user.userId = :userId
          AND c.caseStatus IN (
              com.legalconnect.entity.Case.CaseStatus.active,
              com.legalconnect.entity.Case.CaseStatus.in_progress)
        ORDER BY c.createdAt DESC
        """)
    List<Case> findActiveCasesByLawyerUserId(int userId);

    // CRITICAL: atomic accept — WHERE case_status = 'pending' prevents double-accept
    // Native query used here because JPQL UPDATE cannot navigate to a FK column directly
    @Modifying
    @Query(value = """
        UPDATE cases
        SET case_status = 'active', lawyer_id = :lawyerId
        WHERE case_id = :caseId AND case_status = 'pending'
        """, nativeQuery = true)
    int acceptCaseIfPending(int lawyerId, int caseId);

    // Lawyer: update status (only cases assigned to this lawyer)
    @Modifying
    @Query("""
        UPDATE Case c
        SET c.caseStatus = :status
        WHERE c.caseId = :caseId AND c.lawyer.user.userId = :lawyerUserId
        """)
    int updateStatusByLawyer(int caseId, CaseStatus status, int lawyerUserId);

    // Admin stats
    @Query("""
        SELECT COUNT(c) FROM Case c
        WHERE c.caseStatus IN (
            com.legalconnect.entity.Case.CaseStatus.active,
            com.legalconnect.entity.Case.CaseStatus.in_progress)
        """)
    int countActiveCases();

    // Lawyer dashboard stats
    @Query("SELECT COUNT(c) FROM Case c WHERE c.caseStatus = com.legalconnect.entity.Case.CaseStatus.pending")
    int countPendingCases();

    @Query("SELECT COUNT(DISTINCT c.client.clientId) FROM Case c WHERE c.lawyer.user.userId = :lawyerUserId")
    int countDistinctClientsByLawyer(int lawyerUserId);

    @Query("""
        SELECT COUNT(c) FROM Case c
        WHERE c.lawyer.user.userId = :lawyerUserId
          AND c.caseStatus IN (
              com.legalconnect.entity.Case.CaseStatus.active,
              com.legalconnect.entity.Case.CaseStatus.in_progress)
        """)
    int countActiveCasesByLawyer(int lawyerUserId);
}
