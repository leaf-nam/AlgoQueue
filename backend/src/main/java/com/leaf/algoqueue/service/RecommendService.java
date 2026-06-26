package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.RecommendProblemResponse;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.SolveHistoryRepository;
import com.leaf.algoqueue.repository.entity.Problem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendService {

    private final ProblemRepository problemRepository;
    private final SolveHistoryRepository solveHistoryRepository;

    public List<RecommendProblemResponse> recommend(Long userId) {

        // 1. 사용자가 푼 문제 ID 목록
        List<Long> solvedProblemIds =
                solveHistoryRepository.findSolvedProblemIdsByUserId(userId);

        // 2. 추천 후보 문제 조회 (안 푼 문제)
        List<Problem> candidates =
                problemRepository.findRecommendCandidates(solvedProblemIds);

        // 3. 간단한 정렬 로직 (난이도 + 최신)
        return candidates.stream()
                .map(RecommendProblemResponse::from)
                .limit(20)
                .toList();
    }
}