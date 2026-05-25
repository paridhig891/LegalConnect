package com.legalconnect.service;

import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.*;
import com.legalconnect.exception.AppException;
import com.legalconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final LawyerRepository lawyerRepository;
    private final CaseRepository caseRepository;
    private final ComplaintRepository complaintRepository;
    private final AdminLogRepository adminLogRepository;
    private final NotificationService notificationService;

    public AdminService(UserRepository userRepository,
                        LawyerRepository lawyerRepository,
                        CaseRepository caseRepository,
                        ComplaintRepository complaintRepository,
                        AdminLogRepository adminLogRepository,
                        NotificationService notificationService) {
        this.userRepository = userRepository;
        this.lawyerRepository = lawyerRepository;
        this.caseRepository = caseRepository;
        this.complaintRepository = complaintRepository;
        this.adminLogRepository = adminLogRepository;
        this.notificationService = notificationService;
    }


    public AdminStatsResponse getStats() {
        long pendingVerifications = lawyerRepository.findAll().stream()
                .filter(l -> !l.isVerified()).count();
        int openComplaints = complaintRepository.countOpen();
        long activeUsers   = userRepository.findAll().stream()
                .filter(User::isActive).count();
        int activeCases    = caseRepository.countActiveCases();

        return new AdminStatsResponse(
                (int) pendingVerifications,
                openComplaints,
                (int) activeUsers,
                activeCases
        );
    }


    public List<AdminLawyerView> getAllLawyers() {
        return lawyerRepository.findAllForAdmin().stream()
                .map(l -> {
                    User u = l.getUser();
                    return new AdminLawyerView(
                            u.getUserId(), u.getFirstName(), u.getLastName(),
                            u.getEmail(), l.getBarNumber(), l.getPrimarySpecialization(),
                            l.getCityPractice(), l.isVerified(), u.isActive()
                    );
                })
                .toList();
    }


    @Transactional
    public void performLawyerAction(int adminUserId, AdminActionRequest req) {
        User targetUser = userRepository.findById(req.targetUserId())
                .orElseThrow(() -> AppException.notFound("User not found"));

        String action = req.action().trim().toLowerCase();
        String notifTitle;
        String notifMsg;
        String logAction;
        String logDetails;

        switch (action) {
            case "verify" -> {
                Lawyer lawyer = lawyerRepository.findByUser_UserId(req.targetUserId())
                        .orElseThrow(() -> AppException.notFound("Lawyer profile not found"));
                lawyer.setVerified(true);
                lawyerRepository.save(lawyer);
                targetUser.setActive(true);
                notifTitle   = "Lawyer account verified";
                notifMsg     = "Your lawyer profile has been approved by admin.";
                logAction    = "VERIFY_LAWYER";
                logDetails   = "Verified lawyer profile";
            }
            case "unverify" -> {
                Lawyer lawyer = lawyerRepository.findByUser_UserId(req.targetUserId())
                        .orElseThrow(() -> AppException.notFound("Lawyer profile not found"));
                lawyer.setVerified(false);
                lawyerRepository.save(lawyer);
                notifTitle   = "Verification removed";
                notifMsg     = "Your lawyer verification has been removed by admin.";
                logAction    = "UNVERIFY_LAWYER";
                logDetails   = "Removed lawyer verification";
            }
            case "suspend" -> {
                targetUser.setActive(false);
                notifTitle   = "Account suspended";
                notifMsg     = "Your account was suspended by admin. Contact support for details.";
                logAction    = "SUSPEND_USER";
                logDetails   = "Suspended user account";
            }
            case "activate" -> {
                targetUser.setActive(true);
                notifTitle   = "Account activated";
                notifMsg     = "Your account was reactivated by admin.";
                logAction    = "ACTIVATE_USER";
                logDetails   = "Reactivated user account";
            }
            default -> throw AppException.badRequest("Invalid action. Allowed: verify, unverify, suspend, activate");
        }

        userRepository.save(targetUser);
        notificationService.send(req.targetUserId(), notifTitle, notifMsg, "admin");
        createAdminLog(adminUserId, req.targetUserId(), logAction, logDetails);
    }


    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllForAdmin().stream()
                .map(c -> new ComplaintResponse(
                        c.getComplaintId(),
                        c.getACase().getCaseId(),
                        c.getComplainant().getFirstName() + " " + c.getComplainant().getLastName(),
                        c.getAgainst().getFirstName() + " " + c.getAgainst().getLastName(),
                        c.getDescription(),
                        c.getStatus(),
                        c.getResolutionNote(),
                        c.getCreatedAt(),
                        c.getResolvedAt()
                ))
                .toList();
    }

    @Transactional
    public void updateComplaint(int adminUserId, int complaintId, UpdateComplaintRequest req) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> AppException.notFound("Complaint not found"));

        String newStatus = req.status().trim().toLowerCase();
        complaint.setStatus(newStatus);

        if (req.resolutionNote() != null && !req.resolutionNote().isBlank()) {
            complaint.setResolutionNote(req.resolutionNote().trim());
        }
        if ("resolved".equals(newStatus)) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        complaintRepository.save(complaint);
        createAdminLog(adminUserId, null, "UPDATE_COMPLAINT",
                "Updated complaint #" + complaintId + " to status: " + newStatus);
    }


    public List<AdminLogResponse> getAdminLogs() {
        return adminLogRepository.findRecentLogs().stream()
                .map(l -> {
                    User target = l.getTarget();
                    String targetName = target != null
                            ? target.getFirstName() + " " + target.getLastName()
                            : "";
                    return new AdminLogResponse(
                            l.getLogId(),
                            l.getActionType(),
                            l.getDetails(),
                            l.getAdmin().getFirstName() + " " + l.getAdmin().getLastName(),
                            targetName,
                            l.getCreatedAt()
                    );
                })
                .toList();
    }


    private void createAdminLog(int adminUserId, Integer targetUserId, String actionType, String details) {
        AdminLog log = new AdminLog();
        log.setAdmin(userRepository.getReferenceById(adminUserId));
        if (targetUserId != null) {
            log.setTarget(userRepository.getReferenceById(targetUserId));
        }
        log.setActionType(actionType);
        log.setDetails(details);
        adminLogRepository.save(log);
    }
}
