package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.CodeUpdateRequest;
import com.leaf.algoqueue.common.dto.MemoUpdateRequest;
import com.leaf.algoqueue.common.dto.SolveHistoryCreateRequest;
import com.leaf.algoqueue.common.dto.SolveHistoryResponse;
import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Language;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.SolveHistoryRepository;
import com.leaf.algoqueue.repository.entity.Category;
import com.leaf.algoqueue.repository.entity.Problem;
import com.leaf.algoqueue.repository.entity.SolveHistory;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SolveHistoryServiceTest {

    @InjectMocks
    private SolveHistoryService solveHistoryService;

    @Mock
    private SolveHistoryRepository solveHistoryRepository;

    @Mock
    private UserService userService;

    @Mock
    private ProblemRepository problemRepository;

    @Nested
    @DisplayName("getHistories")
    class GetHistories {

        @Test
        @DisplayName("사용자의 풀이 이력 목록을 반환한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            given(userService.findById(1L)).willReturn(user);
            given(solveHistoryRepository.findAllWithFilter(1L, null, null, null, null, null))
                    .willReturn(List.of(createHistory(1L, user, null, true)));

            List<SolveHistoryResponse> result = solveHistoryService.getHistories(1L, null, null, null, null, null);

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("getHistory")
    class GetHistory {

        @Test
        @DisplayName("단일 풀이 이력을 조회한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            SolveHistory history = createHistory(1L, user, null, true);
            given(solveHistoryRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(history));

            SolveHistoryResponse result = solveHistoryService.getHistory(1L, 1L);

            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("존재하지 않으면 예외를 던진다")
        void notFound() {
            given(solveHistoryRepository.findByIdAndUserId(999L, 1L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> solveHistoryService.getHistory(1L, 999L))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("createHistory")
    class CreateHistory {

        @Test
        @DisplayName("풀이 이력을 생성한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            Problem problem = createProblem(1L, Platform.PROGRAMMERS, "1", "테스트");
            given(userService.findById(1L)).willReturn(user);
            given(problemRepository.findById(1L)).willReturn(Optional.of(problem));
            given(solveHistoryRepository.save(any())).willAnswer(inv -> {
                SolveHistory sh = inv.getArgument(0);
                setId(sh, 1L);
                return sh;
            });

            SolveHistoryCreateRequest req = new SolveHistoryCreateRequest();
            setField(req, "problemId", 1L);
            setField(req, "language", Language.JAVA);
            setField(req, "success", true);
            setField(req, "elapsedTime", 1200);

            SolveHistoryResponse result = solveHistoryService.createHistory(1L, req);

            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("문제가 존재하지 않으면 예외를 던진다")
        void problemNotFound() {
            User user = createUser(1L, "test@test.com", "tester");
            given(userService.findById(1L)).willReturn(user);
            given(problemRepository.findById(999L)).willReturn(Optional.empty());

            SolveHistoryCreateRequest req = new SolveHistoryCreateRequest();
            setField(req, "problemId", 999L);

            assertThatThrownBy(() -> solveHistoryService.createHistory(1L, req))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("updateMemo")
    class UpdateMemo {

        @Test
        @DisplayName("메모를 수정한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            SolveHistory history = createHistory(1L, user, null, true);
            given(solveHistoryRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(history));

            MemoUpdateRequest req = new MemoUpdateRequest();
            setField(req, "memo", "수정된 메모");

            SolveHistoryResponse result = solveHistoryService.updateMemo(1L, 1L, req);

            assertThat(result.getMemo()).isEqualTo("수정된 메모");
        }
    }

    @Nested
    @DisplayName("updateSourceCode")
    class UpdateSourceCode {

        @Test
        @DisplayName("소스코드를 수정한다")
        void test() {
            User user = createUser(1L, "test@test.com", "tester");
            SolveHistory history = createHistory(1L, user, null, true);
            given(solveHistoryRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(history));

            CodeUpdateRequest req = new CodeUpdateRequest();
            setField(req, "sourceCode", "new code");

            SolveHistoryResponse result = solveHistoryService.updateSourceCode(1L, 1L, req);

            assertThat(result.getSourceCode()).isEqualTo("new code");
        }
    }

    @Nested
    @DisplayName("deleteHistory")
    class DeleteHistory {

        @Test
        @DisplayName("풀이 이력을 삭제한다")
        void success() {
            User user = createUser(1L, "test@test.com", "tester");
            SolveHistory history = createHistory(1L, user, null, true);
            given(solveHistoryRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(history));

            solveHistoryService.deleteHistory(1L, 1L);

            verify(solveHistoryRepository).delete(history);
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

    private SolveHistory createHistory(Long id, User user, String memo, boolean success) {
        SolveHistory sh = SolveHistory.builder()
                .user(user)
                .problem(createProblem(1L, Platform.PROGRAMMERS, "1", "테스트"))
                .language(Language.JAVA).success(success).elapsedTime(1200)
                .memo(memo).sourceCode("code").solvedAt(LocalDateTime.now())
                .build();
        setId(sh, id);
        return sh;
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