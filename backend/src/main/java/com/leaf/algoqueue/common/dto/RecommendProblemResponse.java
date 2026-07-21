package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.repository.entity.Problem;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecommendProblemResponse {

    private Long problemId;
    private String platform;
    private String problemNumber;
    private String title;
    private String difficulty;
    private String categoryName;

    public static RecommendProblemResponse from(Problem p) {
        return RecommendProblemResponse.builder()
                .problemId(p.getId())
                .platform(p.getPlatform().name())
                .problemNumber(p.getProblemNumber())
                .title(p.getTitle())
                .difficulty(p.getDifficulty() != null ? p.getDifficulty().name() : null)
                .categoryName(p.getCategory().getName())
                .build();
    }
}