package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.ProblemExtractResponse;
import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Platform;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.Arrays;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProblemExtractService {

    private static final Map<Platform, Pattern> URL_PATTERNS = Map.of(
            Platform.PROGRAMMERS, Pattern.compile("/lessons/(\\d+)"),
            Platform.LEETCODE, Pattern.compile("/problems/([^/]+)"),
            Platform.CODE_TREE, Pattern.compile("/problems/(\\d+)"),
            Platform.HACKERRANK, Pattern.compile("/challenges/([^/]+)"),
            Platform.CODEFORCES, Pattern.compile("/(?:problemset/problem|contest)/(\\d+)/(\\w+)"),
            Platform.ATCODER, Pattern.compile("/tasks/([\\w-]+)"),
            Platform.CODEWARS, Pattern.compile("/kata/([\\w-]+)"),
            Platform.SWEXPERT, Pattern.compile("contestProbId=([\\w]+)")
    );

    private static final Map<Integer, Difficulty> PROGRAMMERS_LEVEL_MAP = Map.of(
            1, Difficulty.VERY_EASY,
            2, Difficulty.EASY,
            3, Difficulty.MEDIUM,
            4, Difficulty.HARD,
            5, Difficulty.VERY_HARD
    );

    public ProblemExtractResponse extract(String urlString) {
        Platform platform = detectPlatform(urlString);
        String problemNumber = extractProblemNumber(urlString, platform);

        String title = null;
        Difficulty difficulty = null;

        Document doc = fetchDocument(urlString);
        if (doc != null) {
            title = extractTitle(doc, platform);
            difficulty = extractDifficulty(doc, platform);
        }

        return new ProblemExtractResponse(platform, problemNumber, title, difficulty);
    }

    private Platform detectPlatform(String urlString) {
        String host = URI.create(urlString).getHost();
        if (host == null) {
            throw new IllegalArgumentException("올바른 URL이 아닙니다.");
        }
        return Arrays.stream(Platform.values())
                .filter(p -> p.getDomains().stream()
                        .anyMatch(d -> host.equals(d) || host.endsWith("." + d)))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("지원하지 않는 플랫폼입니다."));
    }

    private String extractProblemNumber(String urlString, Platform platform) {
        Pattern pattern = URL_PATTERNS.get(platform);
        if (pattern == null) return null;
        Matcher matcher = pattern.matcher(urlString);
        if (!matcher.find()) return null;

        if (platform == Platform.CODEFORCES) {
            return matcher.group(1) + matcher.group(2);
        }
        return matcher.group(1);
    }

    private Document fetchDocument(String url) {
        try {
            return Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(5000)
                    .get();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractTitle(Document doc, Platform platform) {
        return switch (platform) {
            case PROGRAMMERS -> extractProgrammersTitle(doc);
            default -> null;
        };
    }

    private Difficulty extractDifficulty(Document doc, Platform platform) {
        return switch (platform) {
            case PROGRAMMERS -> extractProgrammersDifficulty(doc);
            default -> null;
        };
    }

    private String extractProgrammersTitle(Document doc) {
        String ogTitle = doc.select("meta[property=og:title]").attr("content");
        if (!ogTitle.isBlank()) {
            int idx = ogTitle.indexOf(" - ");
            return idx >= 0 ? ogTitle.substring(idx + 3).trim() : ogTitle.trim();
        }

        String lessonTitle = doc.select("[data-lesson-title]").attr("data-lesson-title");
        if (!lessonTitle.isBlank()) return lessonTitle.trim();

        String titleTag = doc.title();
        if (!titleTag.isBlank()) {
            int idx = titleTag.indexOf(" | ");
            String raw = idx >= 0 ? titleTag.substring(0, idx) : titleTag;
            int dashIdx = raw.indexOf(" - ");
            return dashIdx >= 0 ? raw.substring(dashIdx + 3).trim() : raw.trim();
        }

        return null;
    }

    private Difficulty extractProgrammersDifficulty(Document doc) {
        try {
            String level = doc.select("[data-challenge-level]").attr("data-challenge-level");
            if (level.isBlank()) return null;
            int lv = Integer.parseInt(level);
            return PROGRAMMERS_LEVEL_MAP.getOrDefault(lv, null);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
