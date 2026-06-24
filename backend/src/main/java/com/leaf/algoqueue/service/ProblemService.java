package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.ProblemCreateRequest;
import com.leaf.algoqueue.common.dto.ProblemResponse;
import com.leaf.algoqueue.common.dto.ProblemUpdateRequest;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.CategoryRepository;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.entity.Category;
import com.leaf.algoqueue.repository.entity.Problem;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final CategoryRepository categoryRepository; // Category용 Repository

    // -----------------------------------------------------------------------
    // 조회
    // -----------------------------------------------------------------------

    public List<ProblemResponse> getProblems(Platform platform, Long categoryId, Boolean hidden) {
        return problemRepository.findAllWithFilter(platform, categoryId, hidden)
                .stream()
                .map(ProblemResponse::from)
                .toList();
    }

    public ProblemResponse getProblem(Long id) {
        return ProblemResponse.from(findProblemById(id));
    }

    // -----------------------------------------------------------------------
    // 등록
    // -----------------------------------------------------------------------

    @Transactional
    public ProblemResponse createProblem(ProblemCreateRequest req) {
        if (problemRepository.existsByPlatformAndProblemNumber(req.getPlatform(), req.getProblemNumber())) {
            throw new IllegalArgumentException(
                    "이미 등록된 문제입니다. platform=%s, problemNumber=%s"
                            .formatted(req.getPlatform(), req.getProblemNumber()));
        }

        Category category = findCategoryById(req.getCategoryId());

        Problem problem = Problem.builder()
                .platform(req.getPlatform())
                .problemNumber(req.getProblemNumber())
                .title(req.getTitle())
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
    public ProblemResponse updateProblem(Long id, ProblemUpdateRequest req) {
        Problem problem = findProblemById(id);
        Category category = findCategoryById(req.getCategoryId());

        problem.update(req.getTitle(), req.getDifficulty(), category);

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
}