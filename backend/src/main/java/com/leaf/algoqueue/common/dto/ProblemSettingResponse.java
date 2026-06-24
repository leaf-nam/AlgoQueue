package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Language;
import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.entity.ProblemSetting;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProblemSettingResponse {

    private Long id;
    private Long userId;

    // 문제 요약 정보
    private Long problemId;
    private Platform platform;
    private String problemNumber;
    private String problemTitle;
    private String categoryName;

    // 설정 정보
    private Language language;
    private Integer targetTime;
    private Difficulty difficulty;

    private LocalDateTime createdAt;

    public static ProblemSettingResponse from(ProblemSetting ps) {
        return ProblemSettingResponse.builder()
                .id(ps.getId())
                .userId(ps.getUser().getId())
                .problemId(ps.getProblem().getId())
                .platform(ps.getProblem().getPlatform())
                .problemNumber(ps.getProblem().getProblemNumber())
                .problemTitle(ps.getProblem().getTitle())
                .categoryName(ps.getProblem().getCategory().getName())
                .language(ps.getLanguage())
                .targetTime(ps.getTargetTime())
                .difficulty(ps.getDifficulty())
                .createdAt(ps.getCreatedAt())
                .build();
    }
}