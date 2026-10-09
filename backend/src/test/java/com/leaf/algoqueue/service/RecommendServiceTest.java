package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.RecommendProblemResponse;
import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Language;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.SolveHistoryRepository;
import com.leaf.algoqueue.repository.entity.Category;
import com.leaf.algoqueue.repository.entity.Problem;
import com.leaf.algoqueue.repository.entity.SolveHistory;
import com.leaf.algoqueue.repository.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class RecommendServiceTest {

    @InjectMocks
    private RecommendService recommendService;

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private SolveHistoryRepository solveHistoryRepository;

    @Nested
    @DisplayName("recommend")
    class Recommend {

        @Test
        @DisplayName("안 푼 문제를 추천한다")
        void recommendUnsolvedProblems() {
            given(problemRepository.findAllNonHidden())
                    .willReturn(List.of(
                            createProblem(3L, "문제3"),
                            createProblem(4L, "문제4")
                    ));
            given(solveHistoryRepository.findAllByUserId(1L))
                    .willReturn(List.of(
                            createHistory(1L, 1L, 10, LocalDateTime.now().minusDays(1)),
                            createHistory(2L, 2L, 20, LocalDateTime.now().minusDays(2))
                    ));

            List<RecommendProblemResponse> result = recommendService.recommend(1L);

            assertThat(result).hasSize(2);
            assertThat(result).extracting(RecommendProblemResponse::getTitle)
                    .containsExactlyInAnyOrder("문제3", "문제4");
        }

        @Test
        @DisplayName("모든 문제를 풀었고 15분 초과 문제가 없으면 빈 목록을 반환한다")
        void noCandidates() {
            given(problemRepository.findAllNonHidden())
                    .willReturn(List.of(
                            createProblem(1L, "문제1"),
                            createProblem(2L, "문제2")
                    ));
            given(solveHistoryRepository.findAllByUserId(1L))
                    .willReturn(List.of(
                            createHistory(1L, 1L, 5, LocalDateTime.now().minusDays(1)),
                            createHistory(2L, 2L, 10, LocalDateTime.now().minusDays(2))
                    ));

            List<RecommendProblemResponse> result = recommendService.recommend(1L);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("15분까지는 인정되어 큐에 들어가지 않는다 (15분 초과만 재풀이 대상)")
        void fifteenMinutesIsAllowed() {
            given(problemRepository.findAllNonHidden())
                    .willReturn(List.of(createProblem(1L, "문제1")));
            given(solveHistoryRepository.findAllByUserId(1L))
                    .willReturn(List.of(
                            createHistory(1L, 1L, 15, LocalDateTime.now().minusDays(1))
                    ));

            List<RecommendProblemResponse> result = recommendService.recommend(1L);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("16분 풀이는 15분 초과로 큐에 들어간다")
        void sixteenMinutesIsOvertime() {
            given(problemRepository.findAllNonHidden())
                    .willReturn(List.of(createProblem(1L, "문제1")));
            given(solveHistoryRepository.findAllByUserId(1L))
                    .willReturn(List.of(
                            createHistory(1L, 1L, 16, LocalDateTime.now().minusDays(1))
                    ));

            List<RecommendProblemResponse> result = recommendService.recommend(1L);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getReason()).isEqualTo("OVERTIME");
        }

        @Test
        @DisplayName("실패 + 시간초과 후보는 풀이 날짜 오름차순으로 정렬된다")
        void sortedBySolvedAt() {
            given(problemRepository.findAllNonHidden())
                    .willReturn(List.of(
                            createProblem(1L, "문제1"),
                            createProblem(2L, "문제2"),
                            createProblem(3L, "문제3")
                    ));
            LocalDateTime now = LocalDateTime.now();
            given(solveHistoryRepository.findAllByUserId(1L))
                    .willReturn(List.of(
                            createHistory(1L, 1L, 30, now.minusDays(1)),
                            createFailedHistory(2L, 2L, 5, now.minusDays(3)),
                            createHistory(3L, 3L, 20, now.minusDays(2))
                    ));

            List<RecommendProblemResponse> result = recommendService.recommend(1L);

            assertThat(result).extracting(RecommendProblemResponse::getTitle)
                    .containsExactly("문제2", "문제3", "문제1");
        }

        @Test
        @DisplayName("20개 이상 후보가 있어도 20개만 반환한다")
        void limitTo20() {
            List<Problem> manyProblems = java.util.stream.LongStream.rangeClosed(1, 30)
                    .mapToObj(i -> createProblem(i, "문제" + i))
                    .toList();
            given(problemRepository.findAllNonHidden())
                    .willReturn(manyProblems);
            given(solveHistoryRepository.findAllByUserId(1L))
                    .willReturn(List.of());

            List<RecommendProblemResponse> result = recommendService.recommend(1L);

            assertThat(result).hasSize(20);
        }
    }

    private Problem createProblem(Long id, String title) {
        try {
            Category category = Category.builder().name("기본").hidden(false).build();
            setId(category, 1L);
            Problem p = Problem.builder()
                    .platform(Platform.PROGRAMMERS).problemNumber(String.valueOf(id))
                    .title(title).url("https://example.com")
                    .difficulty(Difficulty.MEDIUM)
                    .category(category)
                    .hidden(false)
                    .build();
            setId(p, id);
            setCreatedAt(p, LocalDateTime.now());
            return p;
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    private SolveHistory createHistory(Long id, Long problemId, int elapsedTime, LocalDateTime solvedAt) {
        return createHistoryWithSuccess(id, problemId, true, elapsedTime, solvedAt);
    }

    private SolveHistory createFailedHistory(Long id, Long problemId, int elapsedTime, LocalDateTime solvedAt) {
        return createHistoryWithSuccess(id, problemId, false, elapsedTime, solvedAt);
    }

    private SolveHistory createHistoryWithSuccess(Long id, Long problemId, boolean success, int elapsedTime, LocalDateTime solvedAt) {
        Problem p = createProblem(problemId, "문제" + problemId);
        User user = User.builder().email("test@test.com").nickname("test").password("pw").build();
        setId(user, 1L);
        SolveHistory h = SolveHistory.builder()
                .user(user)
                .problem(p)
                .language(Language.JAVA)
                .success(success)
                .elapsedTime(elapsedTime)
                .solvedAt(solvedAt)
                .build();
        setId(h, id);
        return h;
    }

    private void setId(Object obj, Long id) {
        try {
            Field f = obj.getClass().getDeclaredField("id");
            f.setAccessible(true);
            f.set(obj, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setCreatedAt(Problem p, LocalDateTime createdAt) {
        try {
            Field f = Problem.class.getDeclaredField("createdAt");
            f.setAccessible(true);
            f.set(p, createdAt);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}