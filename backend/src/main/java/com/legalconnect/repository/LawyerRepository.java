package com.legalconnect.repository;

import com.legalconnect.entity.Lawyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LawyerRepository extends JpaRepository<Lawyer, Integer> {

    Optional<Lawyer> findByUser_UserId(int userId);

    boolean existsByBarNumber(String barNumber);

    @Query("SELECT l FROM Lawyer l JOIN l.user u WHERE u.isActive = true AND l.isVerified = true")
    List<Lawyer> findAllVerifiedAndActive();

    @Query("""
        SELECT l FROM Lawyer l
        JOIN l.user u
        LEFT JOIN LawyerReview lr ON lr.lawyer.userId = u.userId
        WHERE u.isActive = true
          AND l.isVerified = true
          AND (:specialization IS NULL OR l.primarySpecialization = :specialization)
          AND (:experience    IS NULL OR l.yearsExperience = :experience)
          AND (:hourlyRate    IS NULL OR l.hourlyRate = :hourlyRate)
          AND (:location      IS NULL
               OR u.city LIKE :locationPattern
               OR l.stateLicensed LIKE :locationPattern
               OR l.cityPractice LIKE :locationPattern)
        GROUP BY l.lawyerId
        ORDER BY l.isVerified DESC
        """)
    List<Lawyer> searchLawyers(String specialization,
                               String experience,
                               String hourlyRate,
                               String location,
                               String locationPattern);

    @Query("SELECT l FROM Lawyer l JOIN FETCH l.user ORDER BY l.isVerified ASC, l.lawyerId DESC")
    List<Lawyer> findAllForAdmin();
}
