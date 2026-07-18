package com.leaf.algoqueue.common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SuccessUpdateRequest {

    @NotNull(message = "성공 여부는 필수입니다.")
    private Boolean success;
}
