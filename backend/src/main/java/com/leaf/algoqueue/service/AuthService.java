package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.*;
import com.leaf.algoqueue.repository.UserRepository;
import com.leaf.algoqueue.repository.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private static final Duration VERIFY_EXPIRE_TIME = Duration.ofMinutes(3);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;
    private final MailService mailService;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 계정입니다."));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return LoginResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .build();
    }

    public void sendSignupVerification(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        String code = createVerificationCode();

        SignupCache signupCache = SignupCache.builder()
                .email(request.getEmail())
                .nickname(request.getNickname())
                .password(passwordEncoder.encode(request.getPassword()))
                .verificationCode(code)
                .build();

        redisTemplate.opsForValue().set(
                "signup:" + request.getEmail(),
                signupCache,
                VERIFY_EXPIRE_TIME
        );

        mailService.sendVerificationCode(
                request.getEmail(),
                code
        );
    }

    public void sendResetPasswordVerification(
            ForgotPasswordRequest request
    ) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 계정입니다."));

        String code = createVerificationCode();

        redisTemplate.opsForValue().set(
                "reset:" + user.getEmail(),
                code,
                VERIFY_EXPIRE_TIME
        );

        mailService.sendVerificationCode(
                user.getEmail(),
                code
        );
    }

    public UserResponse verifySignup(
            VerifyRequest request
    ) {

        SignupCache cache =
                (SignupCache) redisTemplate.opsForValue()
                        .get("signup:" + request.getEmail());

        if (cache == null) {
            throw new IllegalArgumentException("인증 정보가 만료되었습니다.");
        }

        if (!cache.getVerificationCode()
                .equals(request.getCode())) {
            throw new IllegalArgumentException("인증번호가 올바르지 않습니다.");
        }

        User user = User.builder()
                .email(cache.getEmail())
                .nickname(cache.getNickname())
                .password(cache.getPassword())
                .build();

        userRepository.save(user);

        redisTemplate.delete("signup:" + request.getEmail());

        return UserResponse.from(user);
    }

    public void resetPassword(
            ResetPasswordRequest request
    ) {

        String code = (String) redisTemplate.opsForValue()
                .get("reset:" + request.getEmail());

        if (code == null) {
            throw new IllegalArgumentException("인증 정보가 만료되었습니다.");
        }

        if (!code.equals(request.getCode())) {
            throw new IllegalArgumentException("인증번호가 올바르지 않습니다.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 계정입니다."));

        user.changePassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        redisTemplate.delete("reset:" + request.getEmail());
    }

    private String createVerificationCode() {

        return String.format(
                "%06d",
                ThreadLocalRandom.current().nextInt(0, 1_000_000)
        );
    }
}