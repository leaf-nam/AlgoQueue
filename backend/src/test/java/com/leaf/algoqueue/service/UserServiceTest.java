package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.UserResponse;
import com.leaf.algoqueue.repository.UserRepository;
import com.leaf.algoqueue.repository.entity.User;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Nested
    @DisplayName("getUser")
    class GetUser {

        @Test
        @DisplayName("사용자 정보를 반환한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            given(userRepository.findById(1L)).willReturn(Optional.of(user));

            UserResponse result = userService.getUser(1L);

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getUsername()).isEqualTo("tester");
        }

        @Test
        @DisplayName("존재하지 않는 사용자면 예외를 던진다")
        void notFound() {
            given(userRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUser(999L))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("사용자 엔티티를 반환한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            given(userRepository.findById(1L)).willReturn(Optional.of(user));

            User result = userService.findById(1L);

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getEmail()).isEqualTo("test@test.com");
        }

        @Test
        @DisplayName("존재하지 않으면 예외를 던진다")
        void notFound() {
            given(userRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> userService.findById(999L))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    private User createUser(Long id, String email, String nickname) {
        User user = User.builder()
                .email(email)
                .nickname(nickname)
                .password("encodedPassword")
                .build();
        setId(user, id);
        return user;
    }

    private void setId(User user, Long id) {
        try {
            var field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}