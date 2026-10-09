package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.repository.entity.Problem;
import com.leaf.algoqueue.repository.entity.SolveHistory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RecommendProblemResponse {

    private Long problemId;
    private String platform;
    private String problemNumber;
    private String title;
    private String difficulty;
    private String categoryName;
    /** 재풀이 사유: FAILED(실패) / OVERTIME(15분 초과) / NEW(미풀이) */
    private String reason;
    private LocalDateTime lastSolvedAt;
    private Integer lastElapsedTime;

    public static RecommendProblemResponse from(Problem p, SolveHistory latest) {
        String reason;
        LocalDateTime lastSolvedAt = null;
        Integer lastElapsedTime = null;
        if (latest == null) {
            reason = "NEW";
        } else {
            lastSolvedAt = latest.getSolvedAt();
            lastElapsedTime = latest.getElapsedTime();
            reason = !latest.isSuccess() ? "FAILED" : "OVERTIME";
        }
        return RecommendProblemResponse.builder()
                .problemId(p.getId())
                .platform(p.getPlatform().name())
                .problemNumber(p.getProblemNumber())
                .title(p.getTitle())
                .difficulty(p.getDifficulty() != null ? p.getDifficulty().name() : null)
                .categoryName(p.getCategory().getName())
                .reason(reason)
                .lastSolvedAt(lastSolvedAt)
                .lastElapsedTime(lastElapsedTime)
                .build();
    }
}