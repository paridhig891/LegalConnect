package com.legalconnect.service;

import com.legalconnect.config.FileStorageConfig;
import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.*;
import com.legalconnect.entity.Case.CaseStatus;
import com.legalconnect.exception.AppException;
import com.legalconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;

@Service
public class CaseService {

    private static final Set<String> VALID_STATUSES = Set.of("active", "in_progress", "resolved", "closed");

    private final CaseRepository caseRepository;
    private final ClientRepository clientRepository;
    private final LawyerRepository lawyerRepository;
    private final CaseTimelineRepository timelineRepository;
    private final LawyerReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageConfig fileStorageConfig;

    public CaseService(CaseRepository caseRepository,
                       ClientRepository clientRepository,
                       LawyerRepository lawyerRepository,
                       CaseTimelineRepository timelineRepository,
                       LawyerReviewRepository reviewRepository,
                       UserRepository userRepository,
                       NotificationService notificationService,
                       FileStorageConfig fileStorageConfig) {
        this.caseRepository = caseRepository;
        this.clientRepository = clientRepository;
        this.lawyerRepository = lawyerRepository;
        this.timelineRepository = timelineRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.fileStorageConfig = fileStorageConfig;
    }


    @Transactional
    public void submitCase(int clientUserId, String caseTitle, String caseType, String city,
                           String urgency, String budget, String description,
                           MultipartFile document) {

        Client client = clientRepository.findByUser_UserId(clientUserId)
                .orElseThrow(() -> AppException.notFound("Client profile not found"));

        String documentPath = null;
        if (document != null && !document.isEmpty()) {
            documentPath = saveDocument(document, fileStorageConfig.getCaseDocumentsDir(), "case_documents");
        }

        Case aCase = new Case();
        aCase.setClient(client);
        aCase.setCaseTitle(caseTitle);
        aCase.setCaseType(caseType);
        aCase.setCity(city);
        aCase.setUrgency(urgency);
        aCase.setBudget(budget);
        aCase.setCaseDescription(description);
        aCase.setDocumentPath(documentPath);
        aCase.setCaseStatus(CaseStatus.pending);

        Case saved = caseRepository.save(aCase);

        addTimeline(saved, clientUserId, "pending", "Case submitted by client");
        notifyAllVerifiedLawyers(saved);
    }


    public List<CaseResponse> getClientCases(int clientUserId) {
        return caseRepository.findByClientUserId(clientUserId).stream()
                .map(this::toCaseResponse)
                .toList();
    }


    public List<CaseTrackerResponse> getCaseTracker(int clientUserId) {
        return caseRepository.findByClientUserIdWithLawyer(clientUserId).stream()
                .map(c -> {
                    User lawyerUser = c.getLawyer() != null ? c.getLawyer().getUser() : null;
                    boolean hasReview = reviewRepository.existsByaCase_CaseId(c.getCaseId());
                    boolean canReview = lawyerUser != null
                            && !hasReview
                            && c.getCaseStatus() != CaseStatus.pending;

                    return new CaseTrackerResponse(
                            c.getCaseId(),
                            c.getCaseTitle(),
                            c.getCaseType(),
                            c.getCaseStatus().name(),
                            c.getCity(),
                            c.getCreatedAt(),
                            lawyerUser != null ? lawyerUser.getUserId() : null,
                            lawyerUser != null ? lawyerUser.getFirstName() + " " + lawyerUser.getLastName() : null,
                            canReview
                    );
                })
                .toList();
    }


    public List<CaseResponse> getPendingCases() {
        return caseRepository.findByCaseStatusOrderByCreatedAtDesc(CaseStatus.pending).stream()
                .map(this::toCaseResponse)
                .toList();
    }


    public List<CaseResponse> getActiveCases(int lawyerUserId) {
        return caseRepository.findActiveCasesByLawyerUserId(lawyerUserId).stream()
                .map(this::toCaseResponse)
                .toList();
    }


    @Transactional
    public void acceptCase(int lawyerUserId, int caseId) {
        Lawyer lawyer = lawyerRepository.findByUser_UserId(lawyerUserId)
                .orElseThrow(() -> AppException.notFound("Lawyer profile not found"));

        // CRITICAL: atomic UPDATE WHERE case_status = 'pending'
        // If another lawyer already accepted it, rowsUpdated = 0
        int rowsUpdated = caseRepository.acceptCaseIfPending(lawyer.getLawyerId(), caseId);
        if (rowsUpdated == 0) {
            throw AppException.conflict("This case is no longer available");
        }

        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> AppException.notFound("Case not found"));

        addTimeline(aCase, lawyerUserId, "active", "Case accepted by lawyer");

        int clientUserId = aCase.getClient().getUser().getUserId();
        notificationService.send(clientUserId,
                "Case accepted",
                "Your case #" + caseId + " has been accepted by a lawyer.",
                "case_status", aCase);
    }


    @Transactional
    public void updateStatus(int lawyerUserId, int caseId, String status, String note) {
        String normalised = status.trim().toLowerCase();
        if (!VALID_STATUSES.contains(normalised)) {
            throw AppException.badRequest("Invalid status. Allowed: active, in_progress, resolved, closed");
        }

        CaseStatus newStatus = CaseStatus.valueOf(normalised);
        int updated = caseRepository.updateStatusByLawyer(caseId, newStatus, lawyerUserId);
        if (updated == 0) {
            throw AppException.forbidden("Case not found or you are not assigned to it");
        }

        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> AppException.notFound("Case not found"));

        addTimeline(aCase, lawyerUserId, normalised,
                (note != null && !note.isBlank()) ? note.trim() : null);

        int clientUserId = aCase.getClient().getUser().getUserId();
        notificationService.send(clientUserId,
                "Case status updated",
                "Your case #" + caseId + " is now marked as " + normalised.replace("_", " "),
                "case_status", aCase);

        // When a case is resolved or closed, invite the client to leave a review
        if ("resolved".equals(normalised) || "closed".equals(normalised)) {
            notificationService.send(clientUserId,
                    "Rate your lawyer",
                    "You can now submit a review for case #" + caseId,
                    "review", aCase);
        }
    }


    public List<TimelineEntryResponse> getTimeline(int requestingUserId, String userType, int caseId) {
        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> AppException.notFound("Case not found"));

        if (!canAccessCase(userType, requestingUserId, aCase)) {
            throw AppException.forbidden("You do not have access to this case");
        }

        return timelineRepository.findByCaseIdOrdered(caseId).stream()
                .map(e -> new TimelineEntryResponse(
                        e.getTimelineId(),
                        e.getStatus(),
                        e.getNote(),
                        e.getActor() != null
                                ? e.getActor().getFirstName() + " " + e.getActor().getLastName()
                                : "System",
                        e.getCreatedAt()
                ))
                .toList();
    }


    @Transactional
    public void submitReview(int clientUserId, SubmitReviewRequest req) {
        Case aCase = caseRepository.findById(req.caseId())
                .orElseThrow(() -> AppException.notFound("Case not found"));

        // Verify this client owns the case
        if (aCase.getClient().getUser().getUserId() != clientUserId) {
            throw AppException.forbidden("You do not have access to this case");
        }
        if (aCase.getCaseStatus() == CaseStatus.pending) {
            throw AppException.badRequest("Cannot review a pending case");
        }
        if (aCase.getLawyer() == null) {
            throw AppException.badRequest("No lawyer assigned to this case");
        }
        if (reviewRepository.existsByaCase_CaseId(req.caseId())) {
            throw AppException.conflict("A review has already been submitted for this case");
        }

        User clientUser = userRepository.getReferenceById(clientUserId);
        User lawyerUser = aCase.getLawyer().getUser();

        LawyerReview review = new LawyerReview();
        review.setACase(aCase);
        review.setClient(clientUser);
        review.setLawyer(lawyerUser);
        review.setRating(req.rating());
        review.setReviewText(req.reviewText());
        reviewRepository.save(review);
    }


    public Case findCaseOrThrow(int caseId) {
        return caseRepository.findById(caseId)
                .orElseThrow(() -> AppException.notFound("Case not found"));
    }

    
    public boolean canAccessCase(String userType, int userId, Case aCase) {
        return switch (userType.toLowerCase()) {
            case "client" -> aCase.getClient().getUser().getUserId() == userId;
            case "lawyer" -> aCase.getLawyer() != null
                    && aCase.getLawyer().getUser().getUserId() == userId;
            case "admin"  -> true;
            default       -> false;
        };
    }

    /*
     Returns the counterparty userId — used for complaints.
      Mirrors CaseAccessUtil.getCounterpartyUserId exactly.
     */
    public Integer getCounterpartyUserId(String userType, int userId, Case aCase) {
        if (!canAccessCase(userType, userId, aCase)) return null;
        return switch (userType.toLowerCase()) {
            case "client" -> aCase.getLawyer() != null ? aCase.getLawyer().getUser().getUserId() : null;
            case "lawyer" -> aCase.getClient().getUser().getUserId();
            default       -> null;
        };
    }

    private void addTimeline(Case aCase, Integer actorUserId, String status, String note) {
        CaseTimeline entry = new CaseTimeline();
        entry.setACase(aCase);
        if (actorUserId != null) {
            entry.setActor(userRepository.getReferenceById(actorUserId));
        }
        entry.setStatus(status);
        entry.setNote(note);
        timelineRepository.save(entry);
    }

    private void notifyAllVerifiedLawyers(Case aCase) {
        lawyerRepository.findAllVerifiedAndActive().forEach(lawyer -> {
            int lawyerUserId = lawyer.getUser().getUserId();
            notificationService.send(lawyerUserId,
                    "New case request",
                    "A new case #" + aCase.getCaseId() + " (" + aCase.getCaseTitle() + ") is waiting for lawyers.",
                    "case_request", aCase);
        });
    }

    private CaseResponse toCaseResponse(Case c) {
        return new CaseResponse(
                c.getCaseId(),
                c.getCaseTitle(),
                c.getCaseType(),
                c.getCity(),
                c.getUrgency(),
                c.getBudget(),
                c.getCaseStatus().name(),
                c.getDocumentPath(),
                c.getCreatedAt()
        );
    }

    private String saveDocument(MultipartFile file, String targetDir, String urlPrefix) {
        try {
            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String clean = original.replaceAll("[^a-zA-Z0-9.\\-]", "_");
            String fileName = System.currentTimeMillis() + "_" + clean;
            Path dest = Paths.get(targetDir).resolve(fileName);
            Files.createDirectories(dest.getParent());
            file.transferTo(dest);
            return urlPrefix + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save uploaded file", e);
        }
    }
}
