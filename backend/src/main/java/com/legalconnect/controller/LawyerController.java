package com.legalconnect.controller;

import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.User;
import com.legalconnect.service.LawyerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lawyers")
public class LawyerController {

    private final LawyerService lawyerService;

    public LawyerController(LawyerService lawyerService) {
        this.lawyerService = lawyerService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<LawyerSearchResult>> search(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) String hourlyRate,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(lawyerService.searchLawyers(specialization, experience, hourlyRate, location));
    }

    @GetMapping("/stats")
    public ResponseEntity<LawyerStatsResponse> getStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(lawyerService.getStats(user.getUserId()));
    }

    @PatchMapping("/profile")
    public ResponseEntity<SuccessResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateLawyerProfileRequest req) {
        lawyerService.updateProfile(user.getUserId(), req);
        return ResponseEntity.ok(SuccessResponse.ok("Profile updated."));
    }
}
