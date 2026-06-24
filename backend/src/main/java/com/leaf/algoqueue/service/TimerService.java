package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.TimerStartRequest;
import com.leaf.algoqueue.common.dto.TimerStartResponse;
import com.leaf.algoqueue.common.dto.TimerStopRequest;
import com.leaf.algoqueue.common.dto.TimerStopResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TimerService {

    private final UserService userService;

    // timerKey → startedAt  (단일 서버 환경 기준, 다중 서버라면 Redis로 대체)
    private final Map<String, LocalDateTime> timerStore = new ConcurrentHashMap<>();

    public TimerStartResponse start(TimerStartRequest req) {
        userService.findById(req.getUserId()); // 사용자 존재 검증

        LocalDateTime now = LocalDateTime.now();
        String timerKey = buildKey(req.getUserId(), req.getProblemId(), now);

        timerStore.put(timerKey, now);

        return TimerStartResponse.builder()
                .timerKey(timerKey)
                .userId(req.getUserId())
                .problemId(req.getProblemId())
                .startedAt(now)
                .build();
    }

    public TimerStopResponse stop(TimerStopRequest req) {
        LocalDateTime startedAt = timerStore.remove(req.getTimerKey());
        if (startedAt == null) {
            throw new NoSuchElementException("타이머를 찾을 수 없습니다. timerKey=" + req.getTimerKey());
        }

        LocalDateTime now = LocalDateTime.now();
        int elapsedMinutes = (int) ChronoUnit.MINUTES.between(startedAt, now);

        String[] parts = req.getTimerKey().split(":");
        Long userId    = Long.parseLong(parts[0]);
        Long problemId = Long.parseLong(parts[1]);

        return TimerStopResponse.builder()
                .userId(userId)
                .problemId(problemId)
                .startedAt(startedAt)
                .stoppedAt(now)
                .elapsedMinutes(elapsedMinutes)
                .build();
    }

    // userId:problemId:startEpochSecond
    private String buildKey(Long userId, Long problemId, LocalDateTime startedAt) {
        return "%d:%d:%d".formatted(userId, problemId,
                startedAt.toEpochSecond(java.time.ZoneOffset.UTC));
    }
}