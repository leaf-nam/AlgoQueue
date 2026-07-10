package com.leaf.algoqueue.repository;

import com.leaf.algoqueue.common.enums.Language;
import com.leaf.algoqueue.repository.entity.SolveHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SolveHistoryRepository extends JpaRepository<SolveHistory, Long> {

    /**
     * 풀이 이력 목록 조회 — 필터 + 정렬
     * 모든 파라미터 선택 (null = 전체)
     */
    @Query("""
        SELECT sh FROM SolveHistory sh
        JOIN FETCH sh.problem p
        JOIN FETCH p.category
        WHERE sh.user.id = :userId
          AND (:problemId IS NULL OR p.id        = :problemId)
          AND (:success   IS NULL OR sh.success  = :success)
          AND (:language  IS NULL OR sh.language = :language)
          AND (:from      IS NULL OR sh.solvedAt >= :from)
          AND (:to        IS NULL OR sh.solvedAt <= :to)
        ORDER BY sh.solvedAt DESC
        """)
    List<SolveHistory> findAllWithFilter(
            @Param("userId")    Long userId,
            @Param("problemId") Long problemId,
            @Param("success")   Boolean success,
            @Param("language") Language language,
            @Param("from")      LocalDateTime from,
            @Param("to")        LocalDateTime to
    );

    @Query("""
        SELECT sh FROM SolveHistory sh
        JOIN FETCH sh.problem p
        JOIN FETCH p.category
        WHERE sh.id = :id AND sh.user.id = :userId
        """)
    Optional<SolveHistory> findByIdAndUserId(
            @Param("id")     Long id,
            @Param("userId") Long userId
    );

    @Query("""
        select sh.problem.id
        from SolveHistory sh
        where sh.user.id = :userId
    """)
    List<Long> findSolvedProblemIdsByUserId(Long userId);

    Optional<SolveHistory> findTopByUserIdAndProblemIdOrderBySolvedAtDesc(
            Long userId, Long problemId);
}