import type { Platform } from "../types";

interface UrlPattern {
  platform: Platform;
  domains: string[];
  regex: RegExp;
  problemNumberIndex: number;
}

const URL_PATTERNS: UrlPattern[] = [
  {
    platform: "PROGRAMMERS",
    domains: ["school.programmers.co.kr", "programmers.co.kr"],
    regex: /\/lessons\/(\d+)/,
    problemNumberIndex: 1,
  },
  {
    platform: "LEETCODE",
    domains: ["leetcode.com"],
    regex: /\/problems\/([^/]+)/,
    problemNumberIndex: 1,
  },
  {
    platform: "CODE_TREE",
    domains: ["codetree.ai"],
    regex: /\/problems\/(\d+)/,
    problemNumberIndex: 1,
  },
  {
    platform: "HACKERRANK",
    domains: ["hackerrank.com"],
    regex: /\/challenges\/([^/]+)/,
    problemNumberIndex: 1,
  },
  {
    platform: "CODEFORCES",
    domains: ["codeforces.com"],
    regex: /\/(?:problemset\/problem|contest)\/(\d+)\/(\w+)/,
    problemNumberIndex: 0,
  },
  {
    platform: "ATCODER",
    domains: ["atcoder.jp"],
    regex: /\/tasks\/([\w-]+)/,
    problemNumberIndex: 1,
  },
  {
    platform: "CODEWARS",
    domains: ["codewars.com"],
    regex: /\/kata\/([\w-]+)/,
    problemNumberIndex: 1,
  },
  {
    platform: "SWEXPERT",
    domains: ["swexpertacademy.com"],
    regex: /contestProbId=([\w]+)/,
    problemNumberIndex: 1,
  },
];

export function detectPlatform(url: string): Platform | null {
  try {
    const host = new URL(url).hostname;
    for (const p of URL_PATTERNS) {
      if (p.domains.some((d) => host === d || host.endsWith("." + d))) {
        return p.platform;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function extractProblemNumber(url: string, platform: Platform): string | null {
  const pattern = URL_PATTERNS.find((p) => p.platform === platform);
  if (!pattern) return null;
  const match = url.match(pattern.regex);
  if (!match) return null;
  if (pattern.problemNumberIndex === 0) {
    return match.slice(1).join("");
  }
  return match[pattern.problemNumberIndex] ?? null;
}
