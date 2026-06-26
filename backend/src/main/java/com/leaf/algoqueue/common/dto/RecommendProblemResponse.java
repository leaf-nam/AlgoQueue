package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.repository.entity.Problem;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecommendProblemResponse {

    private Long id;
    private String title;
    private String platform;
    private String difficulty;

    public static RecommendProblemResponse from(Problem p) {
        return RecommendProblemResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .platform(p.getPlatform().name())
                .difficulty(p.getDifficulty().name())
                .build();
    }
}