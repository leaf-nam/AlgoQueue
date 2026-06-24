package com.leaf.algoqueue.controller;

import com.leaf.algoqueue.common.dto.ProblemCreateRequest;
import com.leaf.algoqueue.common.dto.ProblemResponse;
import com.leaf.algoqueue.common.dto.ProblemUpdateRequest;
import com.leaf.algoqueue.common.enums.Platform;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    /**
     * GET /api/problems
     * 문제 목록 조회
     *
     * @param platform   플랫폼 필터 (선택, ex. PROGRAMMERS)
     * @param categoryId 카테고리 필터 (선택)
     * @param hidden     숨김 여부 필터 (선택, true/false/null=전체)
     */
    @GetMapping
    public ResponseEntity<List<ProblemResponse>> getProblems(
            @RequestParam(required = false) Platform platform,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean hidden
    ) {
        return ResponseEntity.ok(problemService.getProblems(platform, categoryId, hidden));
    }

    /**
     * GET /api/problems/{id}
     * 문제 단건 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponse> getProblem(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblem(id));
    }

    /**
     * POST /api/problems
     * 문제 등록
     */
    @PostMapping
    public ResponseEntity<ProblemResponse> createProblem(
            @Valid @RequestBody ProblemCreateRequest request
    ) {
        ProblemResponse response = problemService.createProblem(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    /**
     * PUT /api/problems/{id}
     * 문제 수정 (제목·난이도·카테고리)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProblemResponse> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemUpdateRequest request
    ) {
        return ResponseEntity.ok(problemService.updateProblem(id, request));
    }

    /**
     * PUT /api/problems/{id}/hidden
     * 숨김 여부 토글
     */
    @PutMapping("/{id}/hidden")
    public ResponseEntity<ProblemResponse> toggleHidden(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.toggleHidden(id));
    }

    /**
     * DELETE /api/problems/{id}
     * 문제 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }
}