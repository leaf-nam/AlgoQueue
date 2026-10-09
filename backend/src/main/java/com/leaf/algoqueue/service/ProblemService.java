package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.ProblemCreateRequest;
import com.leaf.algoqueue.common.dto.ProblemResponse;
import com.leaf.algoqueue.common.dto.ProblemUpdateRequest;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.CategoryRepository;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.SolveHistoryRepository;
import com.leaf.algoqueue.repository.entity.Category;
import com.leaf.algoqueue.repository.entity.Problem;
import com.leaf.algoqueue.repository.entity.SolveHistory;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.net.URI;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final CategoryRepository categoryRepository; // Category용 Repository
    private final SolveHistoryRepository solveHistoryRepository;

    // -----------------------------------------------------------------------
    // 조회
    // -----------------------------------------------------------------------

    public List<ProblemResponse> getProblems(Platform platform, Long categoryId, Boolean hidden, Long userId) {
        List<Problem> problems = problemRepository.findAllWithFilter(platform, categoryId, hidden);
        if (userId == null) {
            return problems.stream()
                    .map(p -> ProblemResponse.from(p, 0, null))
                    .toList();
        }
        List<SolveHistory> histories = solveHistoryRepository.findAllByUserId(userId);
        Map<Long, DoubleSummaryStatistics> statsByProblem = histories.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        h -> h.getProblem().getId(),
                        java.util.stream.Collectors.summarizingDouble(h -> h.getElapsedTime())));
        return problems.stream()
                .map(p -> {
                    DoubleSummaryStatistics stats = statsByProblem.get(p.getId());
                    long count = stats == null ? 0 : stats.getCount();
                    Double avg = stats == null ? null : stats.getAverage();
                    return ProblemResponse.from(p, count, avg);
                })
                .toList();
    }

    public ProblemResponse getProblem(Long id) {
        return ProblemResponse.from(findProblemById(id));
    }

    // -----------------------------------------------------------------------
    // 등록
    // -----------------------------------------------------------------------

    @Transactional
    public ProblemResponse createProblem(ProblemCreateRequest req) throws MalformedURLException {
        if (problemRepository.existsByPlatformAndProblemNumber(req.getPlatform(), req.getProblemNumber())) {
            throw new IllegalArgumentException(
                    "이미 등록된 문제입니다. platform=%s, problemNumber=%s"
                            .formatted(req.getPlatform(), req.getProblemNumber()));
        }

        validatePlatformUrl(req.getUrl(), req.getPlatform());

        Category category = findCategoryById(req.getCategoryId());

        Problem problem = Problem.builder()
                .platform(req.getPlatform())
                .problemNumber(req.getProblemNumber())
                .title(req.getTitle())
                .url(req.getUrl())
                .difficulty(req.getDifficulty())
                .category(category)
                .hidden(req.isHidden())
                .build();

        return ProblemResponse.from(problemRepository.save(problem));
    }

    // -----------------------------------------------------------------------
    // 수정
    // -----------------------------------------------------------------------

    @Transactional
    public ProblemResponse updateProblem(Long id, ProblemUpdateRequest req) throws MalformedURLException {
        Problem problem = findProblemById(id);
        Category category = findCategoryById(req.getCategoryId());

        if (req.getUrl() != null) {
            validatePlatformUrl(req.getUrl(), problem.getPlatform());
        }

        problem.update(req.getTitle(), req.getUrl(), req.getDifficulty(), category);

        return ProblemResponse.from(problem);
    }

    @Transactional
    public ProblemResponse toggleHidden(Long id) {
        Problem problem = findProblemById(id);
        problem.updateHidden(!problem.isHidden());
        return ProblemResponse.from(problem);
    }

    // -----------------------------------------------------------------------
    // 삭제
    // -----------------------------------------------------------------------

    @Transactional
    public void deleteProblem(Long id) {
        Problem problem = findProblemById(id);
        problemRepository.delete(problem);
    }

    // -----------------------------------------------------------------------
    // 내부 헬퍼
    // -----------------------------------------------------------------------

    private Problem findProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("문제를 찾을 수 없습니다. id=" + id));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("카테고리를 찾을 수 없습니다. id=" + id));
    }

    private void validatePlatformUrl(String urlString, Platform platform) throws MalformedURLException {
        String host = URI.create(urlString).toURL().getHost();

        boolean matched = platform.getDomains().stream()
                .anyMatch(domain -> host.equals(domain) || host.endsWith("." + domain));

        if (!matched) {
            throw new IllegalArgumentException(
                    "%s 플랫폼의 올바른 URL이 아닙니다. 허용 도메인: %s"
                            .formatted(platform.name(), String.join(", ", platform.getDomains())));
        }
    }
}