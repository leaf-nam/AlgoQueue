package com.leaf.algoqueue.controller;

import com.leaf.algoqueue.common.dto.ProblemSettingRequest;
import com.leaf.algoqueue.common.dto.ProblemSettingResponse;
import com.leaf.algoqueue.common.dto.ProblemSettingUpdateRequest;
import com.leaf.algoqueue.service.ProblemSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/problem-settings")
@RequiredArgsConstructor
public class ProblemSettingController {

    private final ProblemSettingService problemSettingService;

    /**
     * GET /api/users/{userId}/problem-settings
     * 사용자 전체 문제 설정 조회
     */
    @GetMapping
    public ResponseEntity<List<ProblemSettingResponse>> getSettings(@PathVariable Long userId) {
        return ResponseEntity.ok(problemSettingService.getSettings(userId));
    }

    /**
     * GET /api/users/{userId}/problem-settings/{problemId}
     * 특정 문제 설정 조회
     */
    @GetMapping("/{problemId}")
    public ResponseEntity<ProblemSettingResponse> getSetting(
            @PathVariable Long userId,
            @PathVariable Long problemId
    ) {
        return ResponseEntity.ok(problemSettingService.getSetting(userId, problemId));
    }

    /**
     * POST /api/users/{userId}/problem-settings
     * 문제 설정 생성
     */
    @PostMapping
    public ResponseEntity<ProblemSettingResponse> createSetting(
            @PathVariable Long userId,
            @Valid @RequestBody ProblemSettingRequest request
    ) {
        ProblemSettingResponse response = problemSettingService.createSetting(userId, request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{problemId}")
                .buildAndExpand(response.getProblemId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    /**
     * PUT /api/users/{userId}/problem-settings/{problemId}
     * 문제 설정 수정
     */
    @PutMapping("/{problemId}")
    public ResponseEntity<ProblemSettingResponse> updateSetting(
            @PathVariable Long userId,
            @PathVariable Long problemId,
            @Valid @RequestBody ProblemSettingUpdateRequest request
    ) {
        return ResponseEntity.ok(problemSettingService.updateSetting(userId, problemId, request));
    }
}