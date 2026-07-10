package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.ProblemCreateRequest;
import com.leaf.algoqueue.common.dto.ProblemResponse;
import com.leaf.algoqueue.common.dto.ProblemUpdateRequest;
import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.CategoryRepository;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.entity.Category;
import com.leaf.algoqueue.repository.entity.Problem;
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
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProblemServiceTest {

    @InjectMocks
    private ProblemService problemService;

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Nested
    @DisplayName("getProblems")
    class GetProblems {

        @Test
        @DisplayName("필터 없이 전체 문제 목록을 반환한다")
        void withoutFilter() throws Exception {
            Category category = createCategory(1L, "자료구조");
            given(problemRepository.findAllWithFilter(null, null, null))
                    .willReturn(List.of(createProblem(1L, Platform.PROGRAMMERS, "1", "테스트", category)));

            List<ProblemResponse> result = problemService.getProblems(null, null, null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTitle()).isEqualTo("테스트");
        }

        @Test
        @DisplayName("플랫폼과 카테고리로 필터링한다")
        void withFilters() throws MalformedURLException {
            Category category = createCategory(1L, "자료구조");
            given(problemRepository.findAllWithFilter(Platform.PROGRAMMERS, 1L, false))
                    .willReturn(List.of(createProblem(1L, Platform.PROGRAMMERS, "1", "테스트", category)));

            List<ProblemResponse> result = problemService.getProblems(Platform.PROGRAMMERS, 1L, false);

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("getProblem")
    class GetProblem {

        @Test
        @DisplayName("단일 문제를 조회한다")
        void test1() {
            given(problemRepository.findById(1L)).willReturn(Optional.of(createProblem(1L, null, "1", "테스트", null)));

            ProblemResponse result = problemService.getProblem(1L);
            assertThat(result.getTitle()).isEqualTo("테스트");
        }

        @Test
        @DisplayName("존재하지 않는 문제면 예외를 던진다")
        void notFound() {
            given(problemRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> problemService.getProblem(999L))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("createProblem")
    class CreateProblem {

        @Test
        @DisplayName("문제를 생성하고 응답을 반환한다")
        void createTest() throws MalformedURLException {
            Category category = createCategory(1L, "자료구조");
            given(problemRepository.existsByPlatformAndProblemNumber(Platform.PROGRAMMERS, "1")).willReturn(false);
            given(categoryRepository.findById(1L)).willReturn(Optional.of(category));
            given(problemRepository.save(any())).willAnswer(inv -> {
                Problem p = inv.getArgument(0);
                setId(p, 1L);
                return p;
            });

            ProblemCreateRequest req = new ProblemCreateRequest();
            setField(req, "platform", Platform.PROGRAMMERS);
            setField(req, "problemNumber", "1");
            setField(req, "title", "새 문제");
            setField(req, "url", "https://school.programmers.co.kr/learn/courses/30/lessons/1");
            setField(req, "difficulty", Difficulty.MEDIUM);
            setField(req, "categoryId", 1L);
            setField(req, "hidden", false);

            ProblemResponse result = problemService.createProblem(req);

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getTitle()).isEqualTo("새 문제");
        }

        @Test
        @DisplayName("중복된 문제면 예외를 던진다") void duplicate() {
            given(problemRepository.existsByPlatformAndProblemNumber(Platform.PROGRAMMERS, "1")).willReturn(true);

            ProblemCreateRequest req = new ProblemCreateRequest();
            setField(req, "platform", Platform.PROGRAMMERS);
            setField(req, "problemNumber", "1");

            assertThatThrownBy(() -> problemService.createProblem(req))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("이미 등록된 문제");
        }
    }

    @Nested
    @DisplayName("updateProblem")
    class UpdateProblem {
        @Test
        @DisplayName("문제를 수정한다") void success() throws MalformedURLException {
            Category category = createCategory(1L, "자료구조");
            Problem problem = createProblem(1L, Platform.PROGRAMMERS, "1", "테스트", category);
            given(problemRepository.findById(1L)).willReturn(Optional.of(problem));
            given(categoryRepository.findById(1L)).willReturn(Optional.of(category));

            ProblemUpdateRequest req = new ProblemUpdateRequest();
            setField(req, "title", "수정된 제목");
            setField(req, "url", "https://school.programmers.co.kr/learn/courses/30/lessons/2");
            setField(req, "difficulty", Difficulty.HARD);
            setField(req, "categoryId", 1L);

            ProblemResponse result = problemService.updateProblem(1L, req);

            assertThat(result.getTitle()).isEqualTo("수정된 제목");
        }
    }

    @Nested
    @DisplayName("toggleHidden")
    class ToggleHidden {
        @Test
        @DisplayName("hidden 값을 반전시킨다")
        void toggle() {
            Problem problem = createProblem(1L, null, "1", "테스트", null);
            given(problemRepository.findById(1L)).willReturn(Optional.of(problem));

            ProblemResponse result = problemService.toggleHidden(1L);

            assertThat(result.isHidden()).isTrue();
        }
    }

    @Nested
    @DisplayName("deleteProblem")
    class DeleteProblem {
        @Test
        @DisplayName("문제를 삭제한다")
        void success() {
            Problem problem = createProblem(1L, null, "1", "테스트", null);
            given(problemRepository.findById(1L)).willReturn(Optional.of(problem));

            problemService.deleteProblem(1L);

            verify(problemRepository).delete(problem);
        }
    }

    private Category createCategory(Long id, String name) {
        Category c = Category.builder().name(name).hidden(false).build();
        try {
            var f = Category.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(c, id);
        } catch (Exception e) { throw new RuntimeException(e); }
        return c;
    }

    private Problem createProblem(Long id, Platform platform, String problemNumber, String title, Category category) {
        try {
            Problem p = Problem.builder()
                    .platform(platform != null ? platform : Platform.PROGRAMMERS)
                    .problemNumber(problemNumber)
                    .title(title)
                    .url("https://example.com")
                    .difficulty(Difficulty.MEDIUM)
                    .category(category != null ? category : createCategory(0L, "기본"))
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