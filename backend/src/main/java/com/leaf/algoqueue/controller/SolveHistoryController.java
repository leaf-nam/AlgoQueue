package com.leaf.algoqueue.controller;

import com.leaf.algoqueue.common.dto.CodeUpdateRequest;
import com.leaf.algoqueue.common.dto.MemoUpdateRequest;
import com.leaf.algoqueue.common.dto.SolveHistoryCreateRequest;
import com.leaf.algoqueue.common.dto.SolveHistoryResponse;
import com.leaf.algoqueue.common.enums.Language;
import com.leaf.algoqueue.service.SolveHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/solve-histories")
@RequiredArgsConstructor
public class SolveHistoryController {

    private final SolveHistoryService solveHistoryService;

    /**
     * GET /api/users/{userId}/solve-histories
     * 풀이 이력 목록 조회
     *
     * @param problemId 문제 필터 (선택)
     * @param success   성공 여부 필터 (선택)
     * @param language  언어 필터 (선택)
     * @param from      시작 날짜 필터 (선택, ISO_DATE_TIME)
     * @param to        종료 날짜 필터 (선택, ISO_DATE_TIME)
     */
    @GetMapping
    public ResponseEntity<List<SolveHistoryResponse>> getHistories(
            @PathVariable Long userId,
            @RequestParam(required = false) Long problemId,
            @RequestParam(required = false) Boolean success,
            @RequestParam(required = false) Language language,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return ResponseEntity.ok(
                solveHistoryService.getHistories(userId, problemId, success, language, from, to));
    }

    /**
     * GET /api/users/{userId}/solve-histories/{id}
     * 풀이 이력 단건 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<SolveHistoryResponse> getHistory(
            @PathVariable Long userId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(solveHistoryService.getHistory(userId, id));
    }

    /**
     * POST /api/users/{userId}/solve-histories
     * 풀이 이력 기록
     */
    @PostMapping
    public ResponseEntity<SolveHistoryResponse> createHistory(
            @PathVariable Long userId,
            @Valid @RequestBody SolveHistoryCreateRequest request
    ) {
        SolveHistoryResponse response = solveHistoryService.createHistory(userId, request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    /**
     * PUT /api/users/{userId}/solve-histories/{id}/memo
     * 회고 수정
     */
    @PutMapping("/{id}/memo")
    public ResponseEntity<SolveHistoryResponse> updateMemo(
            @PathVariable Long userId,
            @PathVariable Long id,
            @RequestBody MemoUpdateRequest request
    ) {
        return ResponseEntity.ok(solveHistoryService.updateMemo(userId, id, request));
    }

    /**
     * PUT /api/users/{userId}/solve-histories/{id}/code
     * 풀이 코드 수정
     */
    @PutMapping("/{id}/code")
    public ResponseEntity<SolveHistoryResponse> updateSourceCode(
            @PathVariable Long userId,
            @PathVariable Long id,
            @RequestBody CodeUpdateRequest request
    ) {
        return ResponseEntity.ok(solveHistoryService.updateSourceCode(userId, id, request));
    }

    /**
     * DELETE /api/users/{userId}/solve-histories/{id}
     * 풀이 이력 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(
            @PathVariable Long userId,
            @PathVariable Long id
    ) {
        solveHistoryService.deleteHistory(userId, id);
        return ResponseEntity.noContent().build();
    }
}
