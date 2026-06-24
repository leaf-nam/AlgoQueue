package com.leaf.algoqueue.repository;

import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.entity.Category;
import com.leaf.algoqueue.repository.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    /**
     * hidden 필터 조회
     * hidden = null 이면 전체, true/false 이면 해당 값만
     */
    @Query("SELECT c FROM Category c WHERE (:hidden IS NULL OR c.hidden = :hidden) ORDER BY c.name ASC")
    List<Category> findAllWithFilter(@Param("hidden") Boolean hidden);
}