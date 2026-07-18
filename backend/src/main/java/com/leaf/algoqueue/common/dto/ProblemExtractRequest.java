package com.leaf.algoqueue.common.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProblemExtractRequest {

    @NotBlank(message = "URL은 필수입니다.")
    private String url;
}
