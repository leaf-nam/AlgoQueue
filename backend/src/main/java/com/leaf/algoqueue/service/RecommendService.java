package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.RecommendProblemResponse;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.SolveHistoryRepository;
import com.leaf.algoqueue.repository.entity.Problem;
import com.leaf.algoqueue.repository.entity.SolveHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendService {

    private final ProblemRepository problemRepository;
    private final SolveHistoryRepository solveHistoryRepository;

    public List<RecommendProblemResponse> recommend(Long userId) {
        List<Problem> allProblems = problemRepository.findAllNonHidden();

        List<SolveHistory> allHistories = solveHistoryRepository.findAllByUserId(userId);

        Set<Long> solvedProblemIds = allHistories.stream()
                .map(h -> h.getProblem().getId())
                .collect(Collectors.toSet());

        List<Problem> unsolved = allProblems.stream()
                .filter(p -> !solvedProblemIds.contains(p.getId()))
                .sorted(Comparator.comparing(Problem::getCreatedAt).reversed())
                .toList();

        Map<Long, List<SolveHistory>> historyByProblem = allHistories.stream()
                .collect(Collectors.groupingBy(h -> h.getProblem().getId()));

        List<Problem> hardSolved = allProblems.stream()
                .filter(p -> solvedProblemIds.contains(p.getId()))
                .filter(p -> {
                    List<SolveHistory> hists = historyByProblem.get(p.getId());
                    if (hists == null || hists.isEmpty()) return false;
                    int maxTime = hists.stream()
                            .mapToInt(SolveHistory::getElapsedTime)
                            .max().orElse(0);
                    return maxTime >= 15;
                })
                .sorted((a, b) -> {
                    List<SolveHistory> ha = historyByProblem.get(a.getId());
                    List<SolveHistory> hb = historyByProblem.get(b.getId());
                    int maxA = ha.stream().mapToInt(SolveHistory::getElapsedTime).max().orElse(0);
                    int maxB = hb.stream().mapToInt(SolveHistory::getElapsedTime).max().orElse(0);
                    if (maxA != maxB) return Integer.compare(maxB, maxA);
                    Optional<SolveHistory> lastA = ha.stream()
                            .min(Comparator.comparing(SolveHistory::getSolvedAt));
                    Optional<SolveHistory> lastB = hb.stream()
                            .min(Comparator.comparing(SolveHistory::getSolvedAt));
                    if (lastA.isPresent() && lastB.isPresent()) {
                        return lastA.get().getSolvedAt().compareTo(lastB.get().getSolvedAt());
                    }
                    return 0;
                })
                .toList();

        return Stream.concat(unsolved.stream(), hardSolved.stream())
                .map(RecommendProblemResponse::from)
                .limit(20)
                .toList();
    }
}