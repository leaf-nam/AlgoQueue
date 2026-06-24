package com.leaf.algoqueue.common.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TimerStartResponse {

    private String timerKey;       // stop 시 사용할 키 (userId:problemId:startedAt epoch)
    private Long userId;
    private Long problemId;
    private LocalDateTime startedAt;
}