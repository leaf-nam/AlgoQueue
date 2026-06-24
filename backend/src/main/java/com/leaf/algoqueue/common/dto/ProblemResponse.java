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
    private Difficulty difficulty;
    private Long categoryId;
    private String categoryName;
    private boolean hidden;
    private LocalDateTime createdAt;

    public static ProblemResponse from(Problem problem) {
        return ProblemResponse.builder()
                .id(problem.getId())
                .platform(problem.getPlatform())
                .problemNumber(problem.getProblemNumber())
                .title(problem.getTitle())
                .difficulty(problem.getDifficulty())
                .categoryId(problem.getCategory().getId())
                .categoryName(problem.getCategory().getName())
                .hidden(problem.isHidden())
                .createdAt(problem.getCreatedAt())
                .build();
    }
}