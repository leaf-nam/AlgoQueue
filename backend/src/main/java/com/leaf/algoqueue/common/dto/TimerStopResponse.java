package com.leaf.algoqueue.common.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TimerStopResponse {

    private Long userId;
    private Long problemId;
    private LocalDateTime startedAt;
    private LocalDateTime stoppedAt;
    private int elapsedMinutes;   // 클라이언트가 SolveHistory 기록 시 그대로 사용
}