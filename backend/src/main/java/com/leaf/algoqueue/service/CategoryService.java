package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.CategoryCreateRequest;
import com.leaf.algoqueue.common.dto.CategoryResponse;
import com.leaf.algoqueue.common.dto.CategoryUpdateRequest;
import com.leaf.algoqueue.repository.CategoryRepository;
import com.leaf.algoqueue.repository.entity.Category;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // -----------------------------------------------------------------------
    // 조회
    // -----------------------------------------------------------------------

    public List<CategoryResponse> getCategories(Boolean hidden) {
        return categoryRepository.findAllWithFilter(hidden)
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    // -----------------------------------------------------------------------
    // 생성
    // -----------------------------------------------------------------------

    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest req) {
        if (categoryRepository.existsByName(req.getName())) {
            throw new IllegalArgumentException("이미 존재하는 카테고리명입니다. name=" + req.getName());
        }

        Category category = Category.builder()
                .name(req.getName())
                .hidden(req.isHidden())
                .build();

        return CategoryResponse.from(categoryRepository.save(category));
    }

    // -----------------------------------------------------------------------
    // 수정
    // -----------------------------------------------------------------------

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest req) {
        Category category = findById(id);

        if (categoryRepository.existsByNameAndIdNot(req.getName(), id)) {
            throw new IllegalArgumentException("이미 존재하는 카테고리명입니다. name=" + req.getName());
        }

        category.updateName(req.getName());
        return CategoryResponse.from(category);
    }

    @Transactional
    public CategoryResponse toggleHidden(Long id) {
        Category category = findById(id);
        category.updateHidden(!category.isHidden());
        return CategoryResponse.from(category);
    }

    // -----------------------------------------------------------------------
    // 삭제
    // -----------------------------------------------------------------------

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findById(id);

        if (!category.getProblems().isEmpty()) {
            throw new IllegalStateException(
                    "문제가 등록된 카테고리는 삭제할 수 없습니다. problemCount=" + category.getProblems().size());
        }

        categoryRepository.delete(category);
    }

    // -----------------------------------------------------------------------
    // 내부 헬퍼
    // -----------------------------------------------------------------------

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("카테고리를 찾을 수 없습니다. id=" + id));
    }
}