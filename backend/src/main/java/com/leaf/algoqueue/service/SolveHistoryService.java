package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.MemoUpdateRequest;
import com.leaf.algoqueue.common.dto.SolveHistoryCreateRequest;
import com.leaf.algoqueue.common.dto.SolveHistoryResponse;
import com.leaf.algoqueue.common.enums.Language;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.SolveHistoryRepository;
import com.leaf.algoqueue.repository.entity.Problem;
import com.leaf.algoqueue.repository.entity.SolveHistory;
import com.leaf.algoqueue.repository.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SolveHistoryService {

    private final SolveHistoryRepository solveHistoryRepository;
    private final UserService userService;
    private final ProblemRepository problemRepository;

    // -----------------------------------------------------------------------
    // 조회
    // -----------------------------------------------------------------------

    public List<SolveHistoryResponse> getHistories(
            Long userId, Long problemId, Boolean success,
            Language language, LocalDateTime from, LocalDateTime to
    ) {
        userService.findById(userId);
        return solveHistoryRepository.findAllWithFilter(userId, problemId, success, language, from, to)
                .stream()
                .map(SolveHistoryResponse::from)
                .toList();
    }

    public SolveHistoryResponse getHistory(Long userId, Long id) {
        return SolveHistoryResponse.from(findByIdAndUserId(id, userId));
    }

    // -----------------------------------------------------------------------
    // 기록
    // -----------------------------------------------------------------------

    @Transactional
    public SolveHistoryResponse createHistory(Long userId, SolveHistoryCreateRequest req) {
        User user = userService.findById(userId);
        Problem problem = problemRepository.findById(req.getProblemId())
                .orElseThrow(() -> new EntityNotFoundException("문제를 찾을 수 없습니다. id=" + req.getProblemId()));

        SolveHistory history = SolveHistory.builder()
                .user(user)
                .problem(problem)
                .language(req.getLanguage())
                .success(req.getSuccess())
                .elapsedTime(req.getElapsedTime())
                .memo(req.getMemo())
                .solvedAt(req.getSolvedAt())   // null이면 엔티티 생성자에서 now() 처리
                .build();

        return SolveHistoryResponse.from(solveHistoryRepository.save(history));
    }

    // -----------------------------------------------------------------------
    // 수정 (회고만 수정 가능)
    // -----------------------------------------------------------------------

    @Transactional
    public SolveHistoryResponse updateMemo(Long userId, Long id, MemoUpdateRequest req) {
        SolveHistory history = findByIdAndUserId(id, userId);
        history.updateMemo(req.getMemo());
        return SolveHistoryResponse.from(history);
    }

    // -----------------------------------------------------------------------
    // 삭제
    // -----------------------------------------------------------------------

    @Transactional
    public void deleteHistory(Long userId, Long id) {
        SolveHistory history = findByIdAndUserId(id, userId);
        solveHistoryRepository.delete(history);
    }

    // -----------------------------------------------------------------------
    // 내부 헬퍼
    // -----------------------------------------------------------------------

    private SolveHistory findByIdAndUserId(Long id, Long userId) {
        return solveHistoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "풀이 이력을 찾을 수 없습니다. id=%d, userId=%d".formatted(id, userId)));
    }
}