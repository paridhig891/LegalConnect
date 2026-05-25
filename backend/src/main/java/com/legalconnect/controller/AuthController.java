package com.legalconnect.controller;

import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.User;
import com.legalconnect.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register/client")
    public ResponseEntity<SuccessResponse> registerClient(@Valid @RequestBody ClientRegisterRequest req) {
        authService.registerClient(req);
        return ResponseEntity.ok(SuccessResponse.ok("Registration successful. You can now log in."));
    }

    @PostMapping("/register/lawyer")
    public ResponseEntity<SuccessResponse> registerLawyer(@Valid @RequestBody LawyerRegisterRequest req) {
        authService.registerLawyer(req);
        return ResponseEntity.ok(SuccessResponse.ok("Registration submitted. Wait for admin verification before logging in."));
    }

    @PostMapping("/change-password")
    public ResponseEntity<SuccessResponse> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(user.getUserId(), req);
        return ResponseEntity.ok(SuccessResponse.ok("Password updated successfully."));
    }

    @PatchMapping("/profile")
    public ResponseEntity<SuccessResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest req) {
        authService.updateProfile(user.getUserId(), req);
        return ResponseEntity.ok(SuccessResponse.ok("Profile updated."));
    }
}
