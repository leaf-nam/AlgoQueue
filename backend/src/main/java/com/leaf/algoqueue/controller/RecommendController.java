package com.leaf.algoqueue.controller;

import com.leaf.algoqueue.common.dto.RecommendProblemResponse;
import com.leaf.algoqueue.service.RecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;

    @GetMapping("/{userId}/problems/recommend")
    public ResponseEntity<List<RecommendProblemResponse>> recommendProblems(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                recommendService.recommend(userId)
        );
    }
}