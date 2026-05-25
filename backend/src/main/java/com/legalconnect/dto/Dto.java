package com.legalconnect.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

public class Dto {

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record LoginResponse(
        String token,
        String userType,
        String firstName,
        String lastName,
        int userId
    ) {}

    public record ClientRegisterRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank String phone,
        @NotBlank String city,
        @NotBlank @Size(min = 8) String password
    ) {}

    public record LawyerRegisterRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank String phone,
        @NotBlank String city,
        @NotBlank @Size(min = 8) String password,
        @NotBlank String barNumber,
        @NotBlank String stateLicensed,
        @NotBlank String yearsExperience,
        @NotBlank String specialization,
        @NotBlank String hourlyRate
    ) {}

    public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8) String newPassword
    ) {}

    public record UpdateProfileRequest(
        String firstName,
        String lastName,
        String phone,
        String city
    ) {}

    public record UpdateLawyerProfileRequest(
        String bio,
        String primarySpecialization,
        String hourlyRate,
        String cityPractice,
        String yearsExperience
    ) {}


    public record CaseResponse(
        int id,
        String title,
        String type,
        String city,
        String urgency,
        String budget,
        String status,
        String documentPath,
        LocalDateTime createdAt
    ) {}

    public record CaseTrackerResponse(
        int caseId,
        String title,
        String type,
        String status,
        String city,
        LocalDateTime createdAt,
        Integer lawyerUserId,
        String lawyerName,
        boolean canReview
    ) {}

    public record UpdateStatusRequest(
        @NotBlank String status,
        String note
    ) {}


    public record LawyerSearchResult(
        int userId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String city,
        String barNumber,
        String stateLicensed,
        String yearsExperience,
        String specialization,
        String cityPractice,
        String hourlyRate,
        boolean isVerified,
        String bio,
        Double avgRating,
        long reviewCount
    ) {}

    public record LawyerStatsResponse(
        int newCases,
        int activeCases,
        int totalClients,
        double avgRating
    ) {}


    public record ChatListItem(
        int caseId,
        String caseTitle,
        String caseStatus,
        String otherPartyName,
        long unreadCount
    ) {}

    public record MessageResponse(
        int messageId,
        int senderUserId,
        String senderName,
        String messageText,
        String filePath,
        boolean isRead,
        LocalDateTime createdAt
    ) {}


    public record NotificationResponse(
        int notificationId,
        String title,
        String message,
        String type,
        Integer relatedCaseId,
        boolean isRead,
        LocalDateTime createdAt
    ) {}


    public record SubmitReviewRequest(
        @NotNull int caseId,
        @Min(1) @Max(5) int rating,
        String reviewText
    ) {}


    public record SubmitComplaintRequest(
        @NotNull int caseId,
        @NotBlank String description
    ) {}

    public record ComplaintResponse(
        int complaintId,
        int caseId,
        String complainantName,
        String againstName,
        String description,
        String status,
        String resolutionNote,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt
    ) {}

    public record UpdateComplaintRequest(
        @NotBlank String status,
        String resolutionNote
    ) {}


    public record AdminStatsResponse(
        int pendingVerifications,
        int openComplaints,
        int activeUsers,
        int activeCases
    ) {}

    public record AdminLawyerView(
        int userId,
        String firstName,
        String lastName,
        String email,
        String barNumber,
        String specialization,
        String city,
        boolean isVerified,
        boolean isActive
    ) {}

    public record AdminActionRequest(
        @NotBlank String action,   // verify, unverify, suspend, activate
        @NotNull Integer targetUserId
    ) {}

    public record AdminLogResponse(
        int id,
        String action,
        String details,
        String adminName,
        String targetName,
        LocalDateTime createdAt
    ) {}


    public record TimelineEntryResponse(
        int timelineId,
        String status,
        String note,
        String actorName,
        LocalDateTime createdAt
    ) {}



    public record AiChatRequest(
        @NotBlank String message,
        List<AiMessageHistory> history
    ) {}

    public record AiMessageHistory(
        String role,   // "user" or "model"
        String text
    ) {}

    public record AiChatResponse(
        boolean success,
        String reply
    ) {}



    public record SuccessResponse(boolean success, String message) {
        public static SuccessResponse ok() { return new SuccessResponse(true, "Success"); }
        public static SuccessResponse ok(String msg) { return new SuccessResponse(true, msg); }
    }
}
