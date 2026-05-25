package com.legalconnect.controller;

import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.User;
import com.legalconnect.service.CaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<SuccessResponse> submitCase(
            @AuthenticationPrincipal User user,
            @RequestParam("caseTitle")       String caseTitle,
            @RequestParam("caseType")        String caseType,
            @RequestParam("city")            String city,
            @RequestParam("urgency")         String urgency,
            @RequestParam("budget")          String budget,
            @RequestParam("caseDescription") String caseDescription,
            @RequestParam(value = "document", required = false) MultipartFile document) {

        caseService.submitCase(user.getUserId(), caseTitle, caseType, city,
                urgency, budget, caseDescription, document);
        return ResponseEntity.ok(SuccessResponse.ok("Case submitted successfully."));
    }

    @GetMapping("/my")
    public ResponseEntity<List<CaseResponse>> getClientCases(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(caseService.getClientCases(user.getUserId()));
    }

    @GetMapping("/tracker")
    public ResponseEntity<List<CaseTrackerResponse>> getCaseTracker(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(caseService.getCaseTracker(user.getUserId()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CaseResponse>> getPendingCases() {
        return ResponseEntity.ok(caseService.getPendingCases());
    }


    @GetMapping("/active")
    public ResponseEntity<List<CaseResponse>> getActiveCases(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(caseService.getActiveCases(user.getUserId()));
    }

    @PostMapping("/{caseId}/accept")
    public ResponseEntity<SuccessResponse> acceptCase(
            @AuthenticationPrincipal User user,
            @PathVariable int caseId) {
        caseService.acceptCase(user.getUserId(), caseId);
        return ResponseEntity.ok(SuccessResponse.ok("Case accepted."));
    }

    @PatchMapping("/{caseId}/status")
    public ResponseEntity<SuccessResponse> updateStatus(
            @AuthenticationPrincipal User user,
            @PathVariable int caseId,
            @Valid @RequestBody UpdateStatusRequest req) {
        caseService.updateStatus(user.getUserId(), caseId, req.status(), req.note());
        return ResponseEntity.ok(SuccessResponse.ok("Status updated."));
    }

    @GetMapping("/{caseId}/timeline")
    public ResponseEntity<List<TimelineEntryResponse>> getTimeline(
            @AuthenticationPrincipal User user,
            @PathVariable int caseId) {
        List<TimelineEntryResponse> timeline =
                caseService.getTimeline(user.getUserId(), user.getUserType().name(), caseId);
        return ResponseEntity.ok(timeline);
    }
}
