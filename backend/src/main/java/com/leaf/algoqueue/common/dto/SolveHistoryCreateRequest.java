package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.common.enums.Language;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class SolveHistoryCreateRequest {

    @NotNull(message = "문제 ID는 필수입니다.")
    private Long problemId;

    @NotNull(message = "언어는 필수입니다.")
    private Language language;

    @NotNull(message = "성공 여부는 필수입니다.")
    private Boolean success;

    @NotNull(message = "풀이 시간은 필수입니다.")
    @Min(value = 0, message = "풀이 시간은 0분 이상이어야 합니다.")
    private Integer elapsedTime;

    private String memo;

    private String sourceCode;

    // null이면 서버에서 현재 시각으로 세팅
    private LocalDateTime solvedAt;
}
