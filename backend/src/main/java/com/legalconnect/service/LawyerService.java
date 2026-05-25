package com.legalconnect.service;

import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.Case;
import com.legalconnect.entity.Complaint;
import com.legalconnect.entity.Lawyer;
import com.legalconnect.entity.User;
import com.legalconnect.exception.AppException;
import com.legalconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LawyerService {

    private final LawyerRepository lawyerRepository;
    private final LawyerReviewRepository reviewRepository;
    private final CaseRepository caseRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final CaseService caseService;
    private final NotificationService notificationService;

    public LawyerService(LawyerRepository lawyerRepository,
                         LawyerReviewRepository reviewRepository,
                         CaseRepository caseRepository,
                         ComplaintRepository complaintRepository,
                         UserRepository userRepository,
                         CaseService caseService,
                         NotificationService notificationService) {
        this.lawyerRepository = lawyerRepository;
        this.reviewRepository = reviewRepository;
        this.caseRepository = caseRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.caseService = caseService;
        this.notificationService = notificationService;
    }


    public List<LawyerSearchResult> searchLawyers(String specialization, String experience,
                                                   String hourlyRate, String location) {
        String locationPattern = location != null && !location.isBlank() ? "%" + location + "%" : null;
        String nullableSpec    = isBlank(specialization) ? null : specialization;
        String nullableExp     = isBlank(experience)    ? null : experience;
        String nullableRate    = isBlank(hourlyRate)    ? null : hourlyRate;
        String nullableLoc     = isBlank(location)      ? null : location;

        return lawyerRepository.searchLawyers(nullableSpec, nullableExp, nullableRate, nullableLoc, locationPattern)
                .stream()
                .map(l -> {
                    User u = l.getUser();
                    Double avg  = reviewRepository.findAvgRatingByLawyerUserId(u.getUserId());
                    long count  = reviewRepository.countByLawyerUserId(u.getUserId());
                    return new LawyerSearchResult(
                            u.getUserId(), u.getFirstName(), u.getLastName(),
                            u.getEmail(), u.getPhoneNumber(), u.getCity(),
                            l.getBarNumber(), l.getStateLicensed(), l.getYearsExperience(),
                            l.getPrimarySpecialization(), l.getCityPractice(), l.getHourlyRate(),
                            l.isVerified(), l.getBio(),
                            avg, count
                    );
                })
                .toList();
    }


    public LawyerStatsResponse getStats(int lawyerUserId) {
        int newCases    = caseRepository.countPendingCases();
        int activeCases = caseRepository.countActiveCasesByLawyer(lawyerUserId);
        int clients     = caseRepository.countDistinctClientsByLawyer(lawyerUserId);
        Double avg      = reviewRepository.findAvgRatingByLawyerUserId(lawyerUserId);
        return new LawyerStatsResponse(newCases, activeCases, clients, avg != null ? avg : 0.0);
    }

    @Transactional
    public void updateProfile(int lawyerUserId, UpdateLawyerProfileRequest req) {
        Lawyer lawyer = lawyerRepository.findByUser_UserId(lawyerUserId)
                .orElseThrow(() -> AppException.notFound("Lawyer profile not found"));

        if (req.bio()                  != null) lawyer.setBio(req.bio());
        if (req.primarySpecialization() != null) lawyer.setPrimarySpecialization(req.primarySpecialization());
        if (req.hourlyRate()           != null) lawyer.setHourlyRate(req.hourlyRate());
        if (req.cityPractice()         != null) lawyer.setCityPractice(req.cityPractice());
        if (req.yearsExperience()      != null) lawyer.setYearsExperience(req.yearsExperience());

        lawyerRepository.save(lawyer);
    }


    @Transactional
    public void submitComplaint(int complainantUserId, String userType, SubmitComplaintRequest req) {
        Case aCase = caseService.findCaseOrThrow(req.caseId());

        if (!caseService.canAccessCase(userType, complainantUserId, aCase)) {
            throw AppException.forbidden("You do not have access to this case");
        }

        Integer againstUserId = caseService.getCounterpartyUserId(userType, complainantUserId, aCase);
        if (againstUserId == null) {
            throw AppException.badRequest("No counterparty available to file a complaint against");
        }

        User complainant = userRepository.getReferenceById(complainantUserId);
        User against     = userRepository.getReferenceById(againstUserId);

        Complaint complaint = new Complaint();
        complaint.setACase(aCase);
        complaint.setComplainant(complainant);
        complaint.setAgainst(against);
        complaint.setDescription(req.description().trim());
        complaint.setStatus("open");
        complaintRepository.save(complaint);

        notificationService.send(againstUserId,
                "Complaint filed against you",
                "A complaint has been filed against you for case #" + req.caseId() + ". Admin will review it.",
                "admin", aCase);
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
