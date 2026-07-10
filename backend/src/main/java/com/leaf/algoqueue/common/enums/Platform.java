package com.leaf.algoqueue.common.enums;

import java.util.List;

public enum Platform {
    PROGRAMMERS("school.programmers.co.kr", "programmers.co.kr"),
    CODE_TREE("codetree.ai"),
    LEETCODE("leetcode.com"),
    HACKERRANK("hackerrank.com"),
    CODEFORCES("codeforces.com"),
    ATCODER("atcoder.jp"),
    CODEWARS("codewars.com"),
    SWEXPERT("swexpertacademy.com");

    private final List<String> domains;

    Platform(String... domains) {
        this.domains = List.of(domains);
    }

    public List<String> getDomains() {
        return domains;
    }
}