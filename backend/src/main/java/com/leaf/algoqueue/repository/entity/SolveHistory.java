package com.leaf.algoqueue.repository.entity;

import com.leaf.algoqueue.common.Language;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "solve_history",
        indexes = {
                // 추천 문제 조회 쿼리 최적화:
                // WHERE user_id = ? ORDER BY solved_at ASC (4순위: 가장 오래 전에 푼 문제)
                @Index(name = "idx_solve_history_user_solved_at", columnList = "user_id, solved_at"),
                // WHERE user_id = ? AND problem_id = ? (특정 문제 이력 조회)
                @Index(name = "idx_solve_history_user_problem", columnList = "user_id, problem_id")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"user", "problem"})
public class SolveHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Language language;

    /** 성공 여부 — 추천 1순위: success = false */
    @Column(nullable = false)
    private boolean success;

    /** 실제 풀이 시간(분) — 추천 2순위: elapsed_time > target_time */
    @Column(name = "elapsed_time", nullable = false)
    private Integer elapsedTime;

    @Column(columnDefinition = "TEXT")
    private String memo;

    /** 풀이 일시 — 추천 3순위: solved_at <= NOW() - 3일, 4순위: 가장 오래된 순 */
    @Column(nullable = false)
    private LocalDateTime solvedAt;

    @Builder
    public SolveHistory(User user, Problem problem, Language language,
                        boolean success, Integer elapsedTime,
                        String memo, LocalDateTime solvedAt) {
        this.user = user;
        this.problem = problem;
        this.language = language;
        this.success = success;
        this.elapsedTime = elapsedTime;
        this.memo = memo;
        this.solvedAt = solvedAt != null ? solvedAt : LocalDateTime.now();
    }

    public void updateMemo(String memo) {
        this.memo = memo;
    }
}