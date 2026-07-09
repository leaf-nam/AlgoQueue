package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.CategoryCreateRequest;
import com.leaf.algoqueue.common.dto.CategoryResponse;
import com.leaf.algoqueue.common.dto.CategoryUpdateRequest;
import com.leaf.algoqueue.repository.CategoryRepository;
import com.leaf.algoqueue.repository.entity.Category;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @InjectMocks
    private CategoryService categoryService;

    @Mock
    private CategoryRepository categoryRepository;

    @Nested
    @DisplayName("getCategories")
    class GetCategories {

        @Test
        @DisplayName("hidden 필터 없이 전체 카테고리 목록을 반환한다")
        void withoutFilter() {
            given(categoryRepository.findAllWithFilter(null)).willReturn(
                    List.of(createCategory(1L, "자료구조", false))
            );

            List<CategoryResponse> result = categoryService.getCategories(null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("자료구조");
        }

        @Test
        @DisplayName("hidden=false 필터로 공개 카테고리만 조회한다")
        void withHiddenFilter() {
            given(categoryRepository.findAllWithFilter(false)).willReturn(
                    List.of(createCategory(1L, "자료구조", false))
            );

            List<CategoryResponse> result = categoryService.getCategories(false);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).isHidden()).isFalse();
        }
    }

    @Nested
    @DisplayName("createCategory")
    class CreateCategory {

        @Test
        @DisplayName("카테고리를 생성하고 응답을 반환한다")
        void success() {
            given(categoryRepository.existsByName("자료구조")).willReturn(false);
            given(categoryRepository.save(any())).willAnswer(inv -> {
                Category c = inv.getArgument(0);
                setId(c, 1L);
                return c;
            });

            CategoryResponse result = categoryService.createCategory(createReq("자료구조", false));

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getName()).isEqualTo("자료구조");
        }

        @Test
        @DisplayName("중복된 이름이면 예외를 던진다")
        void duplicateName() {
            given(categoryRepository.existsByName("자료구조")).willReturn(true);

            assertThatThrownBy(() -> categoryService.createCategory(createReq("자료구조", false)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("이미 존재하는 카테고리명");
        }
    }

    @Nested
    @DisplayName("updateCategory")
    class UpdateCategory {

        @Test
        @DisplayName("카테고리 이름을 수정한다")
        void success() {
            Category category = createCategory(1L, "자료구조", false);
            given(categoryRepository.findById(1L)).willReturn(Optional.of(category));
            given(categoryRepository.existsByNameAndIdNot("알고리즘", 1L)).willReturn(false);

            CategoryResponse result = categoryService.updateCategory(1L, updateReq("알고리즘"));

            assertThat(result.getName()).isEqualTo("알고리즘");
        }

        @Test
        @DisplayName("존재하지 않는 카테고리면 예외를 던진다")
        void notFound() {
            given(categoryRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> categoryService.updateCategory(999L, updateReq("알고리즘")))
                    .isInstanceOf(EntityNotFoundException.class);
        }

        @Test
        @DisplayName("다른 카테고리와 이름이 중복되면 예외를 던진다")
        void duplicateName() {
            Category category = createCategory(1L, "자료구조", false);
            given(categoryRepository.findById(1L)).willReturn(Optional.of(category));
            given(categoryRepository.existsByNameAndIdNot("알고리즘", 1L)).willReturn(true);

            assertThatThrownBy(() -> categoryService.updateCategory(1L, updateReq("알고리즘")))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("이미 존재하는 카테고리명");
        }
    }

    @Nested
    @DisplayName("toggleHidden")
    class ToggleHidden {

        @Test
        @DisplayName("hidden 값을 반전시킨다")
        void toggle() {
            Category category = createCategory(1L, "자료구조", false);
            given(categoryRepository.findById(1L)).willReturn(Optional.of(category));

            CategoryResponse result = categoryService.toggleHidden(1L);

            assertThat(result.isHidden()).isTrue();
        }
    }

    @Nested
    @DisplayName("deleteCategory")
    class DeleteCategory {

        @Test
        @DisplayName("문제가 없는 카테고리를 삭제한다")
        void success() {
            Category category = createCategory(1L, "자료구조", false);
            given(categoryRepository.findById(1L)).willReturn(Optional.of(category));

            categoryService.deleteCategory(1L);

            verify(categoryRepository).delete(category);
        }

        @Test
        @DisplayName("문제가 있는 카테고리는 삭제할 수 없다")
        void hasProblems() {
            Category category = createCategory(1L, "자료구조", false);
            category.getProblems().add(null);
            given(categoryRepository.findById(1L)).willReturn(Optional.of(category));

            assertThatThrownBy(() -> categoryService.deleteCategory(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("문제가 등록된");
        }
    }

    private CategoryCreateRequest createReq(String name, boolean hidden) {
        CategoryCreateRequest req = new CategoryCreateRequest();
        setField(req, "name", name);
        setField(req, "hidden", hidden);
        return req;
    }

    private CategoryUpdateRequest updateReq(String name) {
        CategoryUpdateRequest req = new CategoryUpdateRequest();
        setField(req, "name", name);
        return req;
    }

    private Category createCategory(Long id, String name, boolean hidden) {
        Category category = Category.builder().name(name).hidden(hidden).build();
        setId(category, id);
        return category;
    }

    private void setId(Category category, Long id) {
        try {
            var field = Category.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(category, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            var field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}