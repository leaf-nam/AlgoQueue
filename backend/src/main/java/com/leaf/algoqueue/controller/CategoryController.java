package com.leaf.algoqueue.controller;

import com.leaf.algoqueue.common.dto.CategoryCreateRequest;
import com.leaf.algoqueue.common.dto.CategoryResponse;
import com.leaf.algoqueue.common.dto.CategoryUpdateRequest;
import com.leaf.algoqueue.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * GET /api/categories
     * 카테고리 목록 조회
     *
     * @param hidden 숨김 여부 필터 (선택, true/false/null=전체)
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @RequestParam(required = false) Boolean hidden
    ) {
        return ResponseEntity.ok(categoryService.getCategories(hidden));
    }

    /**
     * POST /api/categories
     * 카테고리 생성
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        CategoryResponse response = categoryService.createCategory(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    /**
     * PUT /api/categories/{id}
     * 카테고리명 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    /**
     * PUT /api/categories/{id}/hidden
     * 숨김 여부 토글
     */
    @PutMapping("/{id}/hidden")
    public ResponseEntity<CategoryResponse> toggleHidden(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.toggleHidden(id));
    }

    /**
     * DELETE /api/categories/{id}
     * 카테고리 삭제 (문제가 존재하면 삭제 불가)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}