package com.legalconnect.controller;

import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.User;
import com.legalconnect.service.CaseService;
import com.legalconnect.service.LawyerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    private final CaseService caseService;
    private final LawyerService lawyerService;

    public ClientController(CaseService caseService, LawyerService lawyerService) {
        this.caseService = caseService;
        this.lawyerService = lawyerService;
    }


    @PostMapping("/reviews")
    public ResponseEntity<SuccessResponse> submitReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SubmitReviewRequest req) {
        caseService.submitReview(user.getUserId(), req);
        return ResponseEntity.ok(SuccessResponse.ok("Review submitted."));
    }

 
    @PostMapping("/complaints")
    public ResponseEntity<SuccessResponse> submitComplaint(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SubmitComplaintRequest req) {
        lawyerService.submitComplaint(user.getUserId(), user.getUserType().name(), req);
        return ResponseEntity.ok(SuccessResponse.ok("Complaint submitted. Admin will review it."));
    }
}
