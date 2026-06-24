package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.common.enums.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProblemUpdateRequest {

    @NotBlank(message = "문제명은 필수입니다.")
    private String title;

    private Difficulty difficulty;

    @NotNull(message = "카테고리는 필수입니다.")
    private Long categoryId;
}