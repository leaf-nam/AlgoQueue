package com.leaf.algoqueue.common.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TimerStopRequest {

    @NotBlank(message = "타이머 키는 필수입니다.")
    private String timerKey; // start 시 발급된 키
}