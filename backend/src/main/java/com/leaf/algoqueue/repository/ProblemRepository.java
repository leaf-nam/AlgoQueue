package com.leaf.algoqueue.repository;

import com.leaf.algoqueue.common.enums.Platform;
import com.leaf.algoqueue.repository.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    boolean existsByPlatformAndProblemNumber(Platform platform, String problemNumber);

    /**
     * 문제 목록 조회
     * - platform, categoryId, hidden 필터 옵션 (null 이면 전체)
     * - JOIN FETCH로 N+1 방지
     */
    @Query("""
        SELECT p FROM Problem p
        JOIN FETCH p.category c
        WHERE (:platform   IS NULL OR p.platform   = :platform)
          AND (:categoryId IS NULL OR c.id          = :categoryId)
          AND (:hidden     IS NULL OR p.hidden      = :hidden)
        ORDER BY p.createdAt DESC
        """)
    List<Problem> findAllWithFilter(
            @Param("platform")   Platform platform,
            @Param("categoryId") Long categoryId,
            @Param("hidden")     Boolean hidden
    );

    @Query("""
        select p
        from Problem p
        where (:solvedIds is null or p.id not in :solvedIds)
    """)
    List<Problem> findRecommendCandidates(List<Long> solvedIds);
}