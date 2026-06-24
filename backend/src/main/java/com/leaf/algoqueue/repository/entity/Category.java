package com.leaf.algoqueue.repository.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = "problems")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(nullable = false)
    private boolean hidden = false;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Problem> problems = new ArrayList<>();

    @Builder
    public Category(String name, boolean hidden) {
        this.name = name;
        this.hidden = hidden;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updateHidden(boolean hidden) {
        this.hidden = hidden;
    }
}