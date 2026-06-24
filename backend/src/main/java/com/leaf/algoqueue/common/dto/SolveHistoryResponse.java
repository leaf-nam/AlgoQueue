package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.common.enums.Language;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.entity.SolveHistory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SolveHistoryResponse {

    private Long id;
    private Long userId;

    // 문제 요약 정보
    private Long problemId;
    private Platform platform;
    private String problemNumber;
    private String problemTitle;
    private String categoryName;

    // 풀이 정보
    private Language language;
    private boolean success;
    private Integer elapsedTime;
    private String memo;
    private LocalDateTime solvedAt;

    public static SolveHistoryResponse from(SolveHistory sh) {
        return SolveHistoryResponse.builder()
                .id(sh.getId())
                .userId(sh.getUser().getId())
                .problemId(sh.getProblem().getId())
                .platform(sh.getProblem().getPlatform())
                .problemNumber(sh.getProblem().getProblemNumber())
                .problemTitle(sh.getProblem().getTitle())
                .categoryName(sh.getProblem().getCategory().getName())
                .language(sh.getLanguage())
                .success(sh.isSuccess())
                .elapsedTime(sh.getElapsedTime())
                .memo(sh.getMemo())
                .solvedAt(sh.getSolvedAt())
                .build();
    }
}