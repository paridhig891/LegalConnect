package com.legalconnect.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lawyers")
@Getter @Setter @NoArgsConstructor
public class Lawyer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer lawyerId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true)
    private String barNumber;

    private String stateLicensed;
    private String yearsExperience;
    private String primarySpecialization;
    private String cityPractice;
    private String hourlyRate;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;
}
