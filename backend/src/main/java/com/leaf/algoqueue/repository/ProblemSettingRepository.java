package com.leaf.algoqueue.repository;

import com.leaf.algoqueue.repository.entity.ProblemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProblemSettingRepository extends JpaRepository<ProblemSetting, Long> {

    boolean existsByUserIdAndProblemId(Long userId, Long problemId);

    @Query("""
        SELECT ps FROM ProblemSetting ps
        JOIN FETCH ps.problem p
        JOIN FETCH p.category
        WHERE ps.user.id = :userId
        ORDER BY ps.createdAt DESC
        """)
    List<ProblemSetting> findAllByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT ps FROM ProblemSetting ps
        JOIN FETCH ps.problem p
        JOIN FETCH p.category
        WHERE ps.user.id = :userId
          AND ps.problem.id = :problemId
        """)
    Optional<ProblemSetting> findByUserIdAndProblemId(
            @Param("userId") Long userId,
            @Param("problemId") Long problemId
    );
}