package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProblemCreateRequest {

    @NotNull(message = "플랫폼은 필수입니다.")
    private Platform platform;

    @NotBlank(message = "문제 번호는 필수입니다.")
    private String problemNumber;

    @NotBlank(message = "문제명은 필수입니다.")
    private String title;

    private Difficulty difficulty;

    @NotNull(message = "카테고리는 필수입니다.")
    private Long categoryId;

    private boolean hidden = false;
}