package com.leaf.algoqueue.controller;

import com.leaf.algoqueue.common.dto.*;
import com.leaf.algoqueue.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,   // 추가
            HttpServletResponse servletResponse  // 추가
    ) {
        LoginResponse response = authService.login(request, servletRequest, servletResponse);
        return ResponseEntity.ok(response);
    }
    /**
     * POST /api/auth/signup
     * 이메일 인증코드 발송
     */
    @PostMapping("/signup")
    public ResponseEntity<Void> signup(
            @Valid @RequestBody SignupRequest request
    ) {
        authService.sendSignupVerification(request);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/auth/forgot-password
     * 비밀번호 재설정 인증코드 발송
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authService.sendResetPasswordVerification(request);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/auth/verify
     * 회원가입 인증코드 검증
     */
    @PostMapping("/verify")
    public ResponseEntity<UserResponse> verify(
            @Valid @RequestBody VerifyRequest request
    ) {
        return ResponseEntity.ok(authService.verifySignup(request));
    }

    /**
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}