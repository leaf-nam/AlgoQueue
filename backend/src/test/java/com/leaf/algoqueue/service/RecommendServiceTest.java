package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.RecommendProblemResponse;
import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.SolveHistoryRepository;
import com.leaf.algoqueue.repository.entity.Category;
import com.leaf.algoqueue.repository.entity.Problem;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.net.MalformedURLException;
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
            given(solveHistoryRepository.findSolvedProblemIdsByUserId(1L))
                    .willReturn(List.of(1L, 2L));
            given(problemRepository.findRecommendCandidates(List.of(1L, 2L)))
                    .willReturn(List.of(
                            createProblem(3L, "문제3"),
                            createProblem(4L, "문제4")
                    ));

            List<RecommendProblemResponse> result = recommendService.recommend(1L);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getTitle()).isEqualTo("문제3");
        }

        @Test
        @DisplayName("안 푼 문제가 없으면 빈 목록을 반환한다")
        void noCandidates() {
            given(solveHistoryRepository.findSolvedProblemIdsByUserId(1L))
                    .willReturn(List.of(1L, 2L, 3L));
            given(problemRepository.findRecommendCandidates(List.of(1L, 2L, 3L)))
                    .willReturn(List.of());

            List<RecommendProblemResponse> result = recommendService.recommend(1L);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("20개 이상 후보가 있어도 20개만 반환한다")
        void limitTo20() {
            given(solveHistoryRepository.findSolvedProblemIdsByUserId(1L))
                    .willReturn(List.of());
            List<Problem> manyProblems = java.util.stream.LongStream.rangeClosed(1, 30)
                    .mapToObj(i -> createProblem(i, "문제" + i))
                    .toList();
            given(problemRepository.findRecommendCandidates(List.of()))
                    .willReturn(manyProblems);

            List<RecommendProblemResponse> result = recommendService.recommend(1L);

            assertThat(result).hasSize(20);
        }
    }

    private Problem createProblem(Long id, String title) {
        try {
            Problem p = Problem.builder()
                    .platform(Platform.PROGRAMMERS).problemNumber(String.valueOf(id))
                    .title(title).url("https://example.com")
                    .difficulty(Difficulty.MEDIUM)
                    .category(Category.builder().name("기본").hidden(false).build())
                    .hidden(false)
                    .build();
            setId(p, id);
            return p;
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    private void setId(Problem p, Long id) {
        try {
            var f = Problem.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(p, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}