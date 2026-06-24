package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Language;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProblemSettingUpdateRequest {

    @NotNull(message = "언어는 필수입니다.")
    private Language language;

    @NotNull(message = "목표 시간은 필수입니다.")
    @Min(value = 1, message = "목표 시간은 1분 이상이어야 합니다.")
    private Integer targetTime;

    private Difficulty difficulty;
}