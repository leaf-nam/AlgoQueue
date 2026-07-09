package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.ProblemSettingRequest;
import com.leaf.algoqueue.common.dto.ProblemSettingResponse;
import com.leaf.algoqueue.common.dto.ProblemSettingUpdateRequest;
import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Language;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.ProblemSettingRepository;
import com.leaf.algoqueue.repository.entity.Category;
import com.leaf.algoqueue.repository.entity.Problem;
import com.leaf.algoqueue.repository.entity.ProblemSetting;
import com.leaf.algoqueue.repository.entity.User;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.net.MalformedURLException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ProblemSettingServiceTest {

    @InjectMocks
    private ProblemSettingService problemSettingService;

    @Mock
    private ProblemSettingRepository problemSettingRepository;

    @Mock
    private UserService userService;

    @Mock
    private ProblemRepository problemRepository;

    @Nested
    @DisplayName("getSettings")
    class GetSettings {

        @Test
        @DisplayName("사용자의 모든 설정 목록을 반환한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            given(userService.findById(1L)).willReturn(user);
            given(problemSettingRepository.findAllByUserId(1L))
                    .willReturn(List.of(createSetting(1L, user)));

            List<ProblemSettingResponse> result = problemSettingService.getSettings(1L);

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("getSetting")
    class GetSetting {

        @Test
        @DisplayName("특정 문제의 설정을 조회한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            ProblemSetting setting = createSetting(1L, user);
            given(problemSettingRepository.findByUserIdAndProblemId(1L, 1L))
                    .willReturn(Optional.of(setting));

            ProblemSettingResponse result = problemSettingService.getSetting(1L, 1L);

            assertThat(result.getLanguage()).isEqualTo(Language.JAVA);
        }

        @Test
        @DisplayName("설정이 없으면 예외를 던진다")
        void notFound() {
            given(problemSettingRepository.findByUserIdAndProblemId(1L, 999L))
                    .willReturn(Optional.empty());

            assertThatThrownBy(() -> problemSettingService.getSetting(1L, 999L))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("createSetting")
    class CreateSetting {

        @Test
        @DisplayName("설정을 생성한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            Problem problem = createProblem(1L, Platform.PROGRAMMERS, "1", "테스트");
            given(userService.findById(1L)).willReturn(user);
            given(problemRepository.findById(1L)).willReturn(Optional.of(problem));
            given(problemSettingRepository.existsByUserIdAndProblemId(1L, 1L)).willReturn(false);
            given(problemSettingRepository.save(any())).willAnswer(inv -> {
                ProblemSetting ps = inv.getArgument(0);
                setId(ps, 1L);
                return ps;
            });

            ProblemSettingRequest req = new ProblemSettingRequest();
            setField(req, "problemId", 1L);
            setField(req, "language", Language.JAVA);
            setField(req, "targetTime", 30);
            setField(req, "difficulty", Difficulty.MEDIUM);

            ProblemSettingResponse result = problemSettingService.createSetting(1L, req);

            assertThat(result.getTargetTime()).isEqualTo(30);
        }

        @Test
        @DisplayName("이미 설정이 존재하면 예외를 던진다")
        void duplicate() {
            User user = createUser(1L, "test@test.com", "tester");
            Problem problem = createProblem(1L, Platform.PROGRAMMERS, "1", "테스트");
            given(userService.findById(1L)).willReturn(user);
            given(problemRepository.findById(1L)).willReturn(Optional.of(problem));
            given(problemSettingRepository.existsByUserIdAndProblemId(1L, 1L)).willReturn(true);

            ProblemSettingRequest req = new ProblemSettingRequest();
            setField(req, "problemId", 1L);

            assertThatThrownBy(() -> problemSettingService.createSetting(1L, req))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("설정이 존재");
        }
    }

    @Nested
    @DisplayName("updateSetting")
    class UpdateSetting {

        @Test
        @DisplayName("설정을 수정한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            ProblemSetting setting = createSetting(1L, user);
            given(problemSettingRepository.findByUserIdAndProblemId(1L, 1L))
                    .willReturn(Optional.of(setting));

            ProblemSettingUpdateRequest req = new ProblemSettingUpdateRequest();
            setField(req, "language", Language.CPP);
            setField(req, "targetTime", 60);
            setField(req, "difficulty", Difficulty.HARD);

            ProblemSettingResponse result = problemSettingService.updateSetting(1L, 1L, req);

            assertThat(result.getLanguage()).isEqualTo(Language.CPP);
            assertThat(result.getTargetTime()).isEqualTo(60);
            assertThat(result.getDifficulty()).isEqualTo(Difficulty.HARD);
        }

        @Test
        @DisplayName("설정이 없으면 예외를 던진다")
        void notFound() {
            given(problemSettingRepository.findByUserIdAndProblemId(1L, 999L))
                    .willReturn(Optional.empty());

            assertThatThrownBy(() -> problemSettingService.updateSetting(1L, 999L, new ProblemSettingUpdateRequest()))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    private User createUser(Long id, String email, String nickname) {
        User u = User.builder().email(email).nickname(nickname).password("pw").build();
        try { var f = User.class.getDeclaredField("id"); f.setAccessible(true); f.set(u, id); } catch (Exception e) { throw new RuntimeException(e); }
        return u;
    }

    private Problem createProblem(Long id, Platform platform, String number, String title) {
        try {
            Problem p = Problem.builder()
                    .platform(platform).problemNumber(number).title(title)
                    .url("https://example.com").difficulty(Difficulty.MEDIUM)
                    .category(Category.builder().name("기본").hidden(false).build())
                    .hidden(false).build();
            setId(p, id);
            return p;
        } catch (MalformedURLException e) { throw new RuntimeException(e); }
    }

    private ProblemSetting createSetting(Long id, User user) {
        Problem problem = createProblem(1L, Platform.PROGRAMMERS, "1", "테스트");
        ProblemSetting ps = ProblemSetting.builder()
                .user(user).problem(problem)
                .language(Language.JAVA).targetTime(30).difficulty(Difficulty.MEDIUM)
                .build();
        setId(ps, id);
        return ps;
    }

    private void setId(Object entity, Long id) {
        try {
            var f = entity.getClass().getDeclaredField("id");
            f.setAccessible(true);
            f.set(entity, id);
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            var f = target.getClass().getDeclaredField(fieldName);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) { throw new RuntimeException(e); }
    }
}