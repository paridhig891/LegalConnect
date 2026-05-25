package com.legalconnect.repository;

import com.legalconnect.entity.LawyerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LawyerReviewRepository extends JpaRepository<LawyerReview, Integer> {

    boolean existsByaCase_CaseId(int caseId);

    @Query("SELECT AVG(r.rating) FROM LawyerReview r WHERE r.lawyer.userId = :lawyerUserId")
    Double findAvgRatingByLawyerUserId(int lawyerUserId);

    @Query("SELECT COUNT(r) FROM LawyerReview r WHERE r.lawyer.userId = :lawyerUserId")
    long countByLawyerUserId(int lawyerUserId);
}
