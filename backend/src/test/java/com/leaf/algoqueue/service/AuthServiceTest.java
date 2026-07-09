package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.*;
import com.leaf.algoqueue.repository.UserRepository;
import com.leaf.algoqueue.repository.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;

import java.time.Duration;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;
    @Mock
    private SecurityContextRepository securityContextRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    @Mock
    private MailService mailService;
    @Mock
    private HttpServletRequest servletRequest;
    @Mock
    private HttpServletResponse servletResponse;
    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Captor
    private ArgumentCaptor<SignupCache> signupCacheCaptor;

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("로그인에 성공하고 LoginResponse를 반환한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            LoginRequest request = new LoginRequest();
            request.setEmail("test@test.com");
            request.setPassword("pw");

            given(userRepository.findByEmail("test@test.com")).willReturn(Optional.of(user));
            Authentication auth = new UsernamePasswordAuthenticationToken(user, null);
            given(authenticationManager.authenticate(any())).willReturn(auth);

            LoginResponse result = authService.login(request, servletRequest, servletResponse);

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getEmail()).isEqualTo("test@test.com");
            assertThat(result.getNickname()).isEqualTo("tester");
            verify(securityContextRepository).saveContext(any(), eq(servletRequest), eq(servletResponse));
        }

        @Test
        @DisplayName("존재하지 않는 계정이면 예외를 던진다")
        void userNotFound() {
            LoginRequest request = new LoginRequest();
            request.setEmail("unknown@test.com");

            given(userRepository.findByEmail("unknown@test.com")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request, servletRequest, servletResponse))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("존재하지 않는 계정");
        }
    }

    @Nested
    @DisplayName("sendSignupVerification")
    class SendSignupVerification {

        @Test
        @DisplayName("회원가입 인증 메일을 전송한다")
        void success() {
            SignupRequest request = new SignupRequest();
            request.setEmail("new@test.com");
            request.setNickname("newbie");
            request.setPassword("plainPw");

            given(userRepository.existsByEmail("new@test.com")).willReturn(false);
            given(passwordEncoder.encode("plainPw")).willReturn("encodedPw");
            given(redisTemplate.opsForValue()).willReturn(valueOperations);

            authService.sendSignupVerification(request);

            verify(valueOperations).set(eq("signup:new@test.com"), signupCacheCaptor.capture(), any(Duration.class));
            verify(mailService).sendVerificationCode(eq("new@test.com"), any(String.class));

            SignupCache cache = signupCacheCaptor.getValue();
            assertThat(cache.getEmail()).isEqualTo("new@test.com");
            assertThat(cache.getNickname()).isEqualTo("newbie");
            assertThat(cache.getPassword()).isEqualTo("encodedPw");
            assertThat(cache.getVerificationCode()).matches("\\d{6}");
        }

        @Test
        @DisplayName("이미 가입된 이메일이면 예외를 던진다")
        void duplicateEmail() {
            SignupRequest request = new SignupRequest();
            request.setEmail("existing@test.com");

            given(userRepository.existsByEmail("existing@test.com")).willReturn(true);

            assertThatThrownBy(() -> authService.sendSignupVerification(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("이미 가입된 이메일");
        }
    }

    @Nested
    @DisplayName("sendResetPasswordVerification")
    class SendResetPasswordVerification {

        @Test
        @DisplayName("비밀번호 재설정 인증 메일을 전송한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("test@test.com");

            given(userRepository.findByEmail("test@test.com")).willReturn(Optional.of(user));
            given(redisTemplate.opsForValue()).willReturn(valueOperations);

            authService.sendResetPasswordVerification(request);

            verify(valueOperations).set(eq("reset:test@test.com"), any(String.class), any(Duration.class));
            verify(mailService).sendVerificationCode(eq("test@test.com"), any(String.class));
        }

        @Test
        @DisplayName("존재하지 않는 계정이면 예외를 던진다")
        void userNotFound() {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("unknown@test.com");

            given(userRepository.findByEmail("unknown@test.com")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.sendResetPasswordVerification(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("존재하지 않는 계정");
        }
    }

    @Nested
    @DisplayName("verifySignup")
    class VerifySignup {

        @Test
        @DisplayName("인증번호가 일치하면 회원가입을 완료한다")
        void success() {
            SignupCache cache = SignupCache.builder()
                    .email("new@test.com").nickname("newbie")
                    .password("encodedPw").verificationCode("123456")
                    .build();

            given(redisTemplate.opsForValue()).willReturn(valueOperations);
            given(valueOperations.get("signup:test@test.com")).willReturn(cache);
            given(userRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

            VerifyRequest request = new VerifyRequest();
            request.setEmail("test@test.com");
            request.setCode("123456");

            UserResponse result = authService.verifySignup(request);

            assertThat(result.getUsername()).isEqualTo("newbie");
            verify(redisTemplate).delete("signup:test@test.com");
        }

        @Test
        @DisplayName("인증 정보가 만료되었으면 예외를 던진다")
        void cacheExpired() {
            given(redisTemplate.opsForValue()).willReturn(valueOperations);
            given(valueOperations.get("signup:test@test.com")).willReturn(null);

            VerifyRequest request = new VerifyRequest();
            request.setEmail("test@test.com");

            assertThatThrownBy(() -> authService.verifySignup(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("만료");
        }

        @Test
        @DisplayName("인증번호가 올바르지 않으면 예외를 던진다")
        void wrongCode() {
            SignupCache cache = SignupCache.builder().verificationCode("654321").build();
            given(redisTemplate.opsForValue()).willReturn(valueOperations);
            given(valueOperations.get("signup:test@test.com")).willReturn(cache);

            VerifyRequest request = new VerifyRequest();
            request.setEmail("test@test.com");
            request.setCode("123456");

            assertThatThrownBy(() -> authService.verifySignup(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("인증번호가 올바르지 않습니다");
        }
    }

    @Nested
    @DisplayName("resetPassword")
    class ResetPassword {

        @Test
        @DisplayName("인증번호가 일치하면 비밀번호를 재설정한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");

            given(redisTemplate.opsForValue()).willReturn(valueOperations);
            given(valueOperations.get("reset:test@test.com")).willReturn("123456");
            given(userRepository.findByEmail("test@test.com")).willReturn(Optional.of(user));
            given(passwordEncoder.encode("newPw")).willReturn("encodedNewPw");

            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setEmail("test@test.com");
            request.setCode("123456");
            request.setNewPassword("newPw");

            authService.resetPassword(request);

            assertThat(user.getPassword()).isEqualTo("encodedNewPw");
            verify(redisTemplate).delete("reset:test@test.com");
        }

        @Test
        @DisplayName("인증 정보가 만료되었으면 예외를 던진다")
        void cacheExpired() {
            given(redisTemplate.opsForValue()).willReturn(valueOperations);
            given(valueOperations.get("reset:test@test.com")).willReturn(null);

            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setEmail("test@test.com");

            assertThatThrownBy(() -> authService.resetPassword(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("만료");
        }

        @Test
        @DisplayName("인증번호가 올바르지 않으면 예외를 던진다")
        void wrongCode() {
            given(redisTemplate.opsForValue()).willReturn(valueOperations);
            given(valueOperations.get("reset:test@test.com")).willReturn("654321");

            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setEmail("test@test.com");
            request.setCode("123456");

            assertThatThrownBy(() -> authService.resetPassword(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("인증번호가 올바르지 않습니다");
        }

        @Test
        @DisplayName("존재하지 않는 계정이면 예외를 던진다")
        void userNotFound() {
            given(redisTemplate.opsForValue()).willReturn(valueOperations);
            given(valueOperations.get("reset:test@test.com")).willReturn("123456");
            given(userRepository.findByEmail("test@test.com")).willReturn(Optional.empty());

            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setEmail("test@test.com");
            request.setCode("123456");

            assertThatThrownBy(() -> authService.resetPassword(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("존재하지 않는 계정");
        }
    }

    private User createUser(Long id, String email, String nickname) {
        User u = User.builder().email(email).nickname(nickname).password("pw").build();
        try { var f = User.class.getDeclaredField("id"); f.setAccessible(true); f.set(u, id); } catch (Exception e) { throw new RuntimeException(e); }
        return u;
    }
}