package com.leaf.algoqueue.common.enums;

/**
 * 문제 난이도
 * - Problem.difficulty  : 플랫폼 공식 난이도 (예: 백준 티어, 프로그래머스 레벨)
 * - ProblemSetting.difficulty : 사용자가 체감한 난이도
 */
public enum Difficulty {
    VERY_EASY,   // 매우 쉬움
    EASY,        // 쉬움
    MEDIUM,      // 보통
    HARD,        // 어려움
    VERY_HARD    // 매우 어려움
}