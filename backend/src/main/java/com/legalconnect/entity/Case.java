package com.legalconnect.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cases")
@Getter @Setter @NoArgsConstructor
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer caseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id")
    private Lawyer lawyer;

    private String caseTitle;
    private String caseType;

    @Column(columnDefinition = "TEXT")
    private String caseDescription;

    private String city;
    private String urgency;
    private String budget;
    private String documentPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus caseStatus = CaseStatus.pending;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum CaseStatus {
        pending, active, in_progress, resolved, closed
    }
}
