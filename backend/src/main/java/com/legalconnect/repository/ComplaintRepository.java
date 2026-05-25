package com.legalconnect.repository;

import com.legalconnect.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {

    @Query("""
        SELECT c FROM Complaint c
        JOIN FETCH c.aCase
        JOIN FETCH c.complainant
        JOIN FETCH c.against
        ORDER BY c.createdAt DESC
        """)
    List<Complaint> findAllForAdmin();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status IN ('open', 'in_review')")
    int countOpen();
}
