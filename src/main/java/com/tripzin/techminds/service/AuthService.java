package com.tripzin.techminds.service;

import com.tripzin.techminds.dto.request.LoginRequest;
import com.tripzin.techminds.dto.request.SignupRequest;
import com.tripzin.techminds.dto.request.TokenRefreshRequest;
import com.tripzin.techminds.dto.response.JwtResponse;
import com.tripzin.techminds.dto.response.MessageResponse;
import com.tripzin.techminds.dto.response.TokenRefreshResponse;
import com.tripzin.techminds.entity.ERole;
import com.tripzin.techminds.entity.Role;
import com.tripzin.techminds.entity.User;
import com.tripzin.techminds.entity.VerificationToken;
import com.tripzin.techminds.exception.BadRequestException;
import com.tripzin.techminds.exception.ResourceNotFoundException;
import com.tripzin.techminds.exception.TokenRefreshException;
import com.tripzin.techminds.repository.RoleRepository;
import com.tripzin.techminds.repository.UserRepository;
import com.tripzin.techminds.repository.VerificationTokenRepository;
import com.tripzin.techminds.security.jwt.JwtUtils;
import com.tripzin.techminds.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        String accessToken = jwtUtils.generateAccessToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);
        
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        
        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .id(userDetails.getId())
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .email(userDetails.getEmail())
                .phone(userDetails.getPhone())
                .emailVerified(userDetails.isEmailVerified())
                .accountVerified(userDetails.isAccountVerified())
                .roles(roles)
                .build();
    }
    
    @Transactional
    public MessageResponse registerUser(SignupRequest signUpRequest) {
        // Check if email exists
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }
        
        // Check if phone exists
        if (userRepository.existsByPhone(signUpRequest.getPhone())) {
            throw new BadRequestException("Phone number is already in use!");
        }
        
        // Create new user's account
        User user = User.builder()
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .email(signUpRequest.getEmail())
                .phone(signUpRequest.getPhone())
                .password(encoder.encode(signUpRequest.getPassword()))
                .emailVerified(false)
                .accountVerified(false)
                .build();
        
        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();
        
        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new ResourceNotFoundException("Error: Role USER is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ADMIN is not found."));
                        roles.add(adminRole);
                        break;
                    case "mod":
                    case "moderator":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role MODERATOR is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role USER is not found."));
                        roles.add(userRole);
                }
            });
        }
        
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        
        // Create verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(savedUser)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .tokenType(VerificationToken.TokenType.EMAIL_VERIFICATION)
                .build();
        
        tokenRepository.save(verificationToken);
        
        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token);
        
        return MessageResponse.success("User registered successfully! Please check your email to verify your account.");
    }
    
    @Transactional
    public MessageResponse verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));
        
        if (verificationToken.isExpired()) {
            tokenRepository.delete(verificationToken);
            throw new BadRequestException("Verification token has expired");
        }
        
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        
        tokenRepository.delete(verificationToken);
        
        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        
        return MessageResponse.success("Email verified successfully!");
    }
    
    @Transactional
    public MessageResponse resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        
        // Delete existing tokens
        List<VerificationToken> existingTokens = tokenRepository.findByUserAndTokenType(
                user, VerificationToken.TokenType.EMAIL_VERIFICATION);
        tokenRepository.deleteAll(existingTokens);
        
        // Create new token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .tokenType(VerificationToken.TokenType.EMAIL_VERIFICATION)
                .build();
        
        tokenRepository.save(verificationToken);
        
        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token);
        
        return MessageResponse.success("Verification email resent successfully!");
    }
    
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        
        if (!jwtUtils.validateJwtToken(requestRefreshToken)) {
            throw new TokenRefreshException("Invalid refresh token");
        }
        
        String username = jwtUtils.getUserNameFromJwtToken(requestRefreshToken);
        
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new TokenRefreshException("User not found for token: " + requestRefreshToken));
        
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String newAccessToken = jwtUtils.generateAccessToken(userDetails);
        
        return new TokenRefreshResponse(newAccessToken, requestRefreshToken, "Bearer");
    }
}
