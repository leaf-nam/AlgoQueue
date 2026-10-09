package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.entity.Problem;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProblemResponse {

    private Long id;
    private Platform platform;
    private String problemNumber;
    private String title;
    private String url;
    private Difficulty difficulty;
    private Long categoryId;
    private String categoryName;
    private boolean hidden;
    private LocalDateTime createdAt;
    /** 해당 사용자의 풀이 횟수 */
    private long solveCount;
    /** 해당 사용자의 평균 풀이 시간(분, 풀이 없으면 null) */
    private Double avgElapsedTime;

    public static ProblemResponse from(Problem problem) {
        return from(problem, 0, null);
    }

    public static ProblemResponse from(Problem problem, long solveCount, Double avgElapsedTime) {
        return ProblemResponse.builder()
                .id(problem.getId())
                .platform(problem.getPlatform())
                .problemNumber(problem.getProblemNumber())
                .title(problem.getTitle())
                .url(problem.getUrl().toString())
                .difficulty(problem.getDifficulty())
                .categoryId(problem.getCategory().getId())
                .categoryName(problem.getCategory().getName())
                .hidden(problem.isHidden())
                .createdAt(problem.getCreatedAt())
                .solveCount(solveCount)
                .avgElapsedTime(avgElapsedTime)
                .build();
    }
}