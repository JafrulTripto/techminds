package com.tripzin.techminds.controller;

import com.tripzin.techminds.dto.request.EmailVerificationRequest;
import com.tripzin.techminds.dto.request.LoginRequest;
import com.tripzin.techminds.dto.request.ResendVerificationRequest;
import com.tripzin.techminds.dto.request.SignupRequest;
import com.tripzin.techminds.dto.request.TokenRefreshRequest;
import com.tripzin.techminds.dto.response.JwtResponse;
import com.tripzin.techminds.dto.response.MessageResponse;
import com.tripzin.techminds.dto.response.TokenRefreshResponse;
import com.tripzin.techminds.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }
    
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        return ResponseEntity.ok(authService.registerUser(signUpRequest));
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<TokenRefreshResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody EmailVerificationRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request.getToken()));
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmailGet(@RequestParam String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerificationEmail(@Valid @RequestBody ResendVerificationRequest request) {
        return ResponseEntity.ok(authService.resendVerificationEmail(request.getEmail()));
    }
}
