package com.legalconnect.controller;

import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.User;
import com.legalconnect.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    /** All lawyers — verified and unverified — for admin management panel */
    @GetMapping("/lawyers")
    public ResponseEntity<List<AdminLawyerView>> getAllLawyers() {
        return ResponseEntity.ok(adminService.getAllLawyers());
    }

    @PostMapping("/lawyers/action")
    public ResponseEntity<SuccessResponse> performAction(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody AdminActionRequest req) {
        adminService.performLawyerAction(admin.getUserId(), req);
        return ResponseEntity.ok(SuccessResponse.ok("Action performed successfully."));
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getComplaints() {
        return ResponseEntity.ok(adminService.getAllComplaints());
    }

    /** Update a complaint's status (open → in_review → resolved) */
    @PatchMapping("/complaints/{complaintId}")
    public ResponseEntity<SuccessResponse> updateComplaint(
            @AuthenticationPrincipal User admin,
            @PathVariable int complaintId,
            @Valid @RequestBody UpdateComplaintRequest req) {
        adminService.updateComplaint(admin.getUserId(), complaintId, req);
        return ResponseEntity.ok(SuccessResponse.ok("Complaint updated."));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AdminLogResponse>> getLogs() {
        return ResponseEntity.ok(adminService.getAdminLogs());
    }
}
