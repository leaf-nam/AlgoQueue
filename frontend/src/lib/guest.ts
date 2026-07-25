import type {
  Problem,
  Platform,
  Language,
  RecommendProblem,
} from "../types";

// ─── Constants ──────────────────────────────────────────────────────────
const GUEST_HISTORY_KEY = "aq_guest_history";
const GUEST_TOUR_KEY = "aq_guest_tour_done";

export const GUEST_PROBLEMS: Problem[] = [
  {
    id: 9001,
    platform: "PROGRAMMERS",
    problemNumber: "42576",
    title: "완주하지 못한 선수",
    url: "https://school.programmers.co.kr/learn/courses/30/lessons/42576",
    difficulty: "VERY_EASY",
    categoryId: 1,
    categoryName: "해시",
    hidden: false,
    createdAt: "2025-01-01T00:00:00",
  },
  {
    id: 9002,
    platform: "PROGRAMMERS",
    problemNumber: "42577",
    title: "전화번호 목록",
    url: "https://school.programmers.co.kr/learn/courses/30/lessons/42577",
    difficulty: "EASY",
    categoryId: 1,
    categoryName: "해시",
    hidden: false,
    createdAt: "2025-01-02T00:00:00",
  },
  {
    id: 9003,
    platform: "PROGRAMMERS",
    problemNumber: "42578",
    title: "의상",
    url: "https://school.programmers.co.kr/learn/courses/30/lessons/42578",
    difficulty: "EASY",
    categoryId: 1,
    categoryName: "해시",
    hidden: false,
    createdAt: "2025-01-03T00:00:00",
  },
  {
    id: 9004,
    platform: "PROGRAMMERS",
    problemNumber: "42579",
    title: "베스트앨범",
    url: "https://school.programmers.co.kr/learn/courses/30/lessons/42579",
    difficulty: "MEDIUM",
    categoryId: 1,
    categoryName: "해시",
    hidden: false,
    createdAt: "2025-01-04T00:00:00",
  },
  {
    id: 9005,
    platform: "PROGRAMMERS",
    problemNumber: "43162",
    title: "네트워크",
    url: "https://school.programmers.co.kr/learn/courses/30/lessons/43162",
    difficulty: "MEDIUM",
    categoryId: 2,
    categoryName: "DFS/BFS",
    hidden: false,
    createdAt: "2025-01-05T00:00:00",
  },
  {
    id: 9006,
    platform: "PROGRAMMERS",
    problemNumber: "43163",
    title: "단어 변환",
    url: "https://school.programmers.co.kr/learn/courses/30/lessons/43163",
    difficulty: "HARD",
    categoryId: 2,
    categoryName: "DFS/BFS",
    hidden: false,
    createdAt: "2025-01-06T00:00:00",
  },
  {
    id: 9007,
    platform: "PROGRAMMERS",
    problemNumber: "43164",
    title: "여행경로",
    url: "https://school.programmers.co.kr/learn/courses/30/lessons/43164",
    difficulty: "HARD",
    categoryId: 2,
    categoryName: "DFS/BFS",
    hidden: false,
    createdAt: "2025-01-07T00:00:00",
  },
  {
    id: 9008,
    platform: "PROGRAMMERS",
    problemNumber: "42839",
    title: "소수 찾기",
    url: "https://school.programmers.co.kr/learn/courses/30/lessons/42839",
    difficulty: "MEDIUM",
    categoryId: 3,
    categoryName: "완전탐색",
    hidden: false,
    createdAt: "2025-01-08T00:00:00",
  },
  {
    id: 9009,
    platform: "PROGRAMMERS",
    problemNumber: "42842",
    title: "카펫",
    url: "https://school.programmers.co.kr/learn/courses/30/lessons/42842",
    difficulty: "EASY",
    categoryId: 3,
    categoryName: "완전탐색",
    hidden: false,
    createdAt: "2025-01-09T00:00:00",
  },
  {
    id: 9010,
    platform: "LEETCODE",
    problemNumber: "1",
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    difficulty: "VERY_EASY",
    categoryId: 1,
    categoryName: "해시",
    hidden: false,
    createdAt: "2025-01-10T00:00:00",
  },
];

// ─── Guest history helpers ──────────────────────────────────────────────

let guestHistoryCache: GuestSolveHistory[] | null = null;

function loadHistory(): GuestSolveHistory[] {
  if (guestHistoryCache) return guestHistoryCache;
  try {
    const raw = localStorage.getItem(GUEST_HISTORY_KEY);
    guestHistoryCache = raw ? (JSON.parse(raw) as GuestSolveHistory[]) : [];
  } catch {
    guestHistoryCache = [];
  }
  return guestHistoryCache;
}

function persistHistory(h: GuestSolveHistory[]) {
  guestHistoryCache = h;
  localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(h));
}

export interface GuestSolveHistory {
  id: number;
  userId: number;
  problemId: number;
  platform: Platform;
  problemNumber: string;
  problemTitle: string;
  categoryName: string;
  language: Language;
  success: boolean;
  elapsedTime: number;
  memo: string | null;
  sourceCode: string | null;
  solvedAt: string;
}

export function getGuestHistory(): GuestSolveHistory[] {
  return loadHistory();
}

export function addGuestHistory(entry: Omit<GuestSolveHistory, "id">) {
  const list = loadHistory();
  const id = list.length > 0 ? Math.max(...list.map((h) => h.id)) + 1 : 1;
  list.push({ ...entry, id });
  persistHistory(list);
}

export function clearGuestHistory() {
  persistHistory([]);
}

export function getGuestCategories() {
  const names = [...new Set(GUEST_PROBLEMS.map((p) => p.categoryName))];
  return names.map((name, i) => ({
    id: i + 1,
    name,
    hidden: false,
    problemCount: GUEST_PROBLEMS.filter((p) => p.categoryName === name).length,
  }));
}

export function getGuestProblems() {
  return GUEST_PROBLEMS;
}

// ─── Guest tour ─────────────────────────────────────────────────────────

export function isGuestTourDone(): boolean {
  return localStorage.getItem(GUEST_TOUR_KEY) === "true";
}

export function markGuestTourDone() {
  localStorage.setItem(GUEST_TOUR_KEY, "true");
}

// ─── Guest recommendation (ported from RecommendService.java) ───────────

export function getGuestRecommends(): RecommendProblem[] {
  const allProblems = GUEST_PROBLEMS;
  const allHistories = loadHistory();

  const solvedProblemIds = new Set(allHistories.map((h) => h.problemId));

  const historyByProblem = new Map<number, GuestSolveHistory[]>();
  for (const h of allHistories) {
    const list = historyByProblem.get(h.problemId);
    if (list) list.push(h);
    else historyByProblem.set(h.problemId, [h]);
  }

  const latestByProblem = new Map<number, GuestSolveHistory>();
  for (const [pid, hists] of historyByProblem) {
    const latest = hists.reduce((a, b) =>
      a.solvedAt > b.solvedAt ? a : b,
    );
    latestByProblem.set(pid, latest);
  }

  const failed = allProblems
    .filter((p) => {
      const h = latestByProblem.get(p.id);
      return h != null && !h.success;
    })
    .sort(
      (a, b) =>
        latestByProblem.get(a.id)!.solvedAt.localeCompare(
          latestByProblem.get(b.id)!.solvedAt,
        ),
    );

  const failedIds = new Set(failed.map((p) => p.id));
  const longTime = allProblems
    .filter((p) => !failedIds.has(p.id))
    .filter((p) => {
      const h = latestByProblem.get(p.id);
      return h != null && h.elapsedTime >= 15;
    })
    .sort(
      (a, b) =>
        latestByProblem.get(a.id)!.solvedAt.localeCompare(
          latestByProblem.get(b.id)!.solvedAt,
        ),
    );

  const shuffled: Problem[] = [];
  let i = 0, j = 0;
  while (i < failed.length || j < longTime.length) {
    if (i >= failed.length) {
      shuffled.push(longTime[j++]);
    } else if (j >= longTime.length) {
      shuffled.push(failed[i++]);
    } else if (Math.random() < 0.5) {
      shuffled.push(failed[i++]);
    } else {
      shuffled.push(longTime[j++]);
    }
  }

  const unsolved = allProblems
    .filter((p) => !solvedProblemIds.has(p.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return [...shuffled, ...unsolved].slice(0, 20).map((p) => ({
    problemId: p.id,
    platform: p.platform,
    problemNumber: p.problemNumber,
    title: p.title,
    difficulty: p.difficulty,
    categoryName: p.categoryName,
  }));
}
