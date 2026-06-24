package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.repository.entity.Category;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private boolean hidden;
    private int problemCount;

    public static CategoryResponse from(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .hidden(category.isHidden())
                .problemCount(category.getProblems().size())
                .build();
    }
}