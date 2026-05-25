package com.legalconnect.repository;

import com.legalconnect.entity.CaseTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CaseTimelineRepository extends JpaRepository<CaseTimeline, Integer> {

    @Query("""
        SELECT ct FROM CaseTimeline ct
        LEFT JOIN FETCH ct.actor
        WHERE ct.aCase.caseId = :caseId
        ORDER BY ct.createdAt ASC
        """)
    List<CaseTimeline> findByCaseIdOrdered(int caseId);
}
