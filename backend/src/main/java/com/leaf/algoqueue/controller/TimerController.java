package com.leaf.algoqueue.controller;

import com.leaf.algoqueue.common.dto.TimerStartRequest;
import com.leaf.algoqueue.common.dto.TimerStartResponse;
import com.leaf.algoqueue.common.dto.TimerStopRequest;
import com.leaf.algoqueue.common.dto.TimerStopResponse;
import com.leaf.algoqueue.service.TimerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/timer")
@RequiredArgsConstructor
public class TimerController {

    private final TimerService timerService;

    /**
     * POST /api/timer/start
     * 타이머 시작
     * 응답으로 timerKey를 반환 → stop 호출 시 필요
     */
    @PostMapping("/start")
    public ResponseEntity<TimerStartResponse> start(@Valid @RequestBody TimerStartRequest request) {
        return ResponseEntity.ok(timerService.start(request));
    }

    /**
     * POST /api/timer/stop
     * 타이머 종료 → elapsedMinutes 반환
     * 클라이언트는 이 값을 SolveHistory 기록(POST /solve-histories)에 그대로 사용
     */
    @PostMapping("/stop")
    public ResponseEntity<TimerStopResponse> stop(@Valid @RequestBody TimerStopRequest request) {
        return ResponseEntity.ok(timerService.stop(request));
    }
}