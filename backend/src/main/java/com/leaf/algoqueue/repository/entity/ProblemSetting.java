package com.leaf.algoqueue.repository.entity;

import com.leaf.algoqueue.common.Difficulty;
import com.leaf.algoqueue.common.Language;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "problem_setting",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_user_problem_setting",
                columnNames = {"user_id", "problem_id"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"user", "problem"})
public class ProblemSetting {

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

    /** 사용자 목표 풀이 시간 (분) */
    @Column(name = "target_time", nullable = false)
    private Integer targetTime;

    /**
     * 사용자 체감 난이도
     * 플랫폼 공식 난이도(Problem.difficulty)와 별개로 사용자가 주관적으로 평가
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Difficulty difficulty;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public ProblemSetting(User user, Problem problem, Language language,
                          Integer targetTime, Difficulty difficulty) {
        this.user = user;
        this.problem = problem;
        this.language = language;
        this.targetTime = targetTime;
        this.difficulty = difficulty;
    }

    public void update(Language language, Integer targetTime, Difficulty difficulty) {
        this.language = language;
        this.targetTime = targetTime;
        this.difficulty = difficulty;
    }
}