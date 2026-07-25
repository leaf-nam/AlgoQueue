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

        List<Problem> failed = allProblems.stream()
                .filter(p -> {
                    SolveHistory h = latestByProblem.get(p.getId());
                    return h != null && !h.isSuccess();
                })
                .sorted(comparing(p -> latestByProblem.get(p.getId()).getSolvedAt()))
                .toList();

        Set<Long> failedIds = failed.stream().map(Problem::getId).collect(Collectors.toSet());
        List<Problem> longTime = allProblems.stream()
                .filter(p -> !failedIds.contains(p.getId()))
                .filter(p -> {
                    SolveHistory h = latestByProblem.get(p.getId());
                    return h != null && h.getElapsedTime() >= 15;
                })
                .sorted(comparing(p -> latestByProblem.get(p.getId()).getSolvedAt()))
                .toList();

        List<Problem> shuffled = new ArrayList<>();
        int i = 0, j = 0;
        Random rand = new Random();
        while (i < failed.size() || j < longTime.size()) {
            if (i >= failed.size()) {
                shuffled.add(longTime.get(j++));
            } else if (j >= longTime.size()) {
                shuffled.add(failed.get(i++));
            } else if (rand.nextBoolean()) {
                shuffled.add(failed.get(i++));
            } else {
                shuffled.add(longTime.get(j++));
            }
        }

        List<Problem> unsolved = allProblems.stream()
                .filter(p -> !solvedProblemIds.contains(p.getId()))
                .sorted(comparing(Problem::getCreatedAt).reversed())
                .toList();

        return Stream.concat(shuffled.stream(), unsolved.stream())
                .map(RecommendProblemResponse::from)
                .limit(20)
                .toList();
    }
}