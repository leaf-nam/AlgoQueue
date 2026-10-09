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

import static java.util.Comparator.comparing;

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

        Map<Long, List<SolveHistory>> historyByProblem = allHistories.stream()
                .collect(Collectors.groupingBy(h -> h.getProblem().getId()));

        Map<Long, SolveHistory> latestByProblem = new HashMap<>();
        for (var entry : historyByProblem.entrySet()) {
            latestByProblem.put(entry.getKey(), entry.getValue().stream()
                    .max(comparing(SolveHistory::getSolvedAt)).orElse(null));
        }

        List<Problem> retry = allProblems.stream()
                .filter(p -> {
                    SolveHistory h = latestByProblem.get(p.getId());
                    return h != null && (!h.isSuccess() || h.getElapsedTime() > 15);
                })
                .sorted(comparing(p -> latestByProblem.get(p.getId()).getSolvedAt()))
                .toList();

        List<Problem> unsolved = allProblems.stream()
                .filter(p -> !solvedProblemIds.contains(p.getId()))
                .sorted(comparing(Problem::getCreatedAt).reversed())
                .toList();

        return Stream.concat(retry.stream(), unsolved.stream())
                .map(p -> RecommendProblemResponse.from(p, latestByProblem.get(p.getId())))
                .limit(20)
                .toList();
    }
}