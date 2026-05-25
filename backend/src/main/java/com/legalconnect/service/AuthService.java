package com.legalconnect.service;

import com.legalconnect.config.JwtUtil;
import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.Client;
import com.legalconnect.entity.Lawyer;
import com.legalconnect.entity.User;
import com.legalconnect.exception.AppException;
import com.legalconnect.repository.ClientRepository;
import com.legalconnect.repository.LawyerRepository;
import com.legalconnect.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final LawyerRepository lawyerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       ClientRepository clientRepository,
                       LawyerRepository lawyerRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.lawyerRepository = lawyerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> AppException.badRequest("Invalid email or password"));

        if (!user.isActive()) {
            throw AppException.forbidden("Account is suspended. Contact support.");
        }

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw AppException.badRequest("Invalid email or password");
        }

        userRepository.updateLastLogin(user.getUserId());

        String token = jwtUtil.generateToken(user);
        return new LoginResponse(token, user.getUserType().name(),
                user.getFirstName(), user.getLastName(), user.getUserId());
    }

    @Transactional
    public void registerClient(ClientRegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw AppException.conflict("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setUserType(User.UserType.client);
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setPhoneNumber(req.phone());
        user.setCity(req.city());

        User saved = userRepository.save(user);

        Client client = new Client();
        client.setUser(saved);
        clientRepository.save(client);
    }

    @Transactional
    public void registerLawyer(LawyerRegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw AppException.conflict("An account with this email already exists");
        }
        if (lawyerRepository.existsByBarNumber(req.barNumber())) {
            throw AppException.conflict("This bar number is already registered");
        }

        User user = new User();
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setUserType(User.UserType.lawyer);
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setPhoneNumber(req.phone());
        user.setCity(req.city());
        // Lawyers start as inactive until admin verifies
        user.setActive(false);

        User saved = userRepository.save(user);

        Lawyer lawyer = new Lawyer();
        lawyer.setUser(saved);
        lawyer.setBarNumber(req.barNumber());
        lawyer.setStateLicensed(req.stateLicensed());
        lawyer.setYearsExperience(req.yearsExperience());
        lawyer.setPrimarySpecialization(req.specialization());
        lawyer.setCityPractice(req.city());
        lawyer.setHourlyRate(req.hourlyRate());
        lawyer.setVerified(false);
        lawyerRepository.save(lawyer);
    }

    @Transactional
    public void changePassword(int userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User not found"));

        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw AppException.badRequest("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void updateProfile(int userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User not found"));

        if (req.firstName() != null && !req.firstName().isBlank()) user.setFirstName(req.firstName());
        if (req.lastName()  != null && !req.lastName().isBlank())  user.setLastName(req.lastName());
        if (req.phone()     != null && !req.phone().isBlank())     user.setPhoneNumber(req.phone());
        if (req.city()      != null && !req.city().isBlank())      user.setCity(req.city());

        userRepository.save(user);
    }
}
