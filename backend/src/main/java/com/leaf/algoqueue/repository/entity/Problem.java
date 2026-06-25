package com.leaf.algoqueue.repository.entity;

import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Platform;
import jakarta.persistence.*;
import lombok.*;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.net.URLStreamHandler;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "problem",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_platform_problem_number",
                columnNames = {"platform", "problem_number"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"category", "solveHistories", "problemSettings"})
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Platform platform;

    @Column(nullable = false, length = 20, name = "problem_number")
    private String problemNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 200)
    private URL url;

    /**
     * 플랫폼 공식 난이도
     * 예: 백준 Bronze~Ruby, 프로그래머스 Level 1~5 → 공통 5단계로 매핑
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Difficulty difficulty;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private boolean hidden = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SolveHistory> solveHistories = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProblemSetting> problemSettings = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Problem(Platform platform, String problemNumber, String title, String url,
                   Difficulty difficulty, Category category, boolean hidden) throws MalformedURLException {
        this.platform = platform;
        this.problemNumber = problemNumber;
        this.title = title;
        this.url = URI.create(url).toURL();
        this.difficulty = difficulty;
        this.category = category;
        this.hidden = hidden;
    }

    // 제목·난이도·카테고리 수정
    public void update(String title, String url, Difficulty difficulty, Category category) throws MalformedURLException {
        this.title = title;
        this.url = URI.create(url).toURL();
        this.difficulty = difficulty;
        this.category = category;
    }

    public void updateHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public void updateDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }
}