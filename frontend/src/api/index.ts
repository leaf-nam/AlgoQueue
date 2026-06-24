import type {
  Category,
  Problem,
  ProblemSetting,
  SolveHistory,
  RecommendProblem,
  TimerStartResponse,
  TimerStopResponse,
  User,
  Platform,
  Language,
  Difficulty,
} from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── User ─────────────────────────────────────────────────────────────────────
export const api = {
  users: {
    get: (id: number) => req<User>(`/api/users/${id}`),
    create: (username: string) =>
      req<User>("/api/users", {
        method: "POST",
        body: JSON.stringify({ username }),
      }),
  },

  // ─── Category ───────────────────────────────────────────────────────────────
  categories: {
    list: (hidden?: boolean) => {
      const q = hidden !== undefined ? `?hidden=${hidden}` : "";
      return req<Category[]>(`/api/categories${q}`);
    },
    create: (name: string, hidden = false) =>
      req<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name, hidden }),
      }),
    update: (id: number, name: string) =>
      req<Category>(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      }),
    toggleHidden: (id: number) =>
      req<Category>(`/api/categories/${id}/hidden`, { method: "PUT" }),
    delete: (id: number) =>
      req<void>(`/api/categories/${id}`, { method: "DELETE" }),
  },

  // ─── Problem ────────────────────────────────────────────────────────────────
  problems: {
    list: (params?: {
      platform?: Platform;
      categoryId?: number;
      hidden?: boolean;
    }) => {
      const q = new URLSearchParams();
      if (params?.platform) q.set("platform", params.platform);
      if (params?.categoryId) q.set("categoryId", String(params.categoryId));
      if (params?.hidden !== undefined) q.set("hidden", String(params.hidden));
      return req<Problem[]>(`/api/problems${q.size ? `?${q}` : ""}`);
    },
    get: (id: number) => req<Problem>(`/api/problems/${id}`),
    create: (body: {
      platform: Platform;
      problemNumber: string;
      title: string;
      difficulty?: Difficulty;
      categoryId: number;
      hidden?: boolean;
    }) =>
      req<Problem>("/api/problems", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (
      id: number,
      body: { title: string; difficulty?: Difficulty; categoryId: number },
    ) =>
      req<Problem>(`/api/problems/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    toggleHidden: (id: number) =>
      req<Problem>(`/api/problems/${id}/hidden`, { method: "PUT" }),
    delete: (id: number) =>
      req<void>(`/api/problems/${id}`, { method: "DELETE" }),
  },

  // ─── ProblemSetting ─────────────────────────────────────────────────────────
  settings: {
    list: (userId: number) =>
      req<ProblemSetting[]>(`/api/users/${userId}/problem-settings`),
    get: (userId: number, problemId: number) =>
      req<ProblemSetting>(`/api/users/${userId}/problem-settings/${problemId}`),
    create: (
      userId: number,
      body: {
        problemId: number;
        language: Language;
        targetTime: number;
        difficulty?: Difficulty;
      },
    ) =>
      req<ProblemSetting>(`/api/users/${userId}/problem-settings`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (
      userId: number,
      problemId: number,
      body: {
        language: Language;
        targetTime: number;
        difficulty?: Difficulty;
      },
    ) =>
      req<ProblemSetting>(
        `/api/users/${userId}/problem-settings/${problemId}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      ),
  },

  // ─── SolveHistory ───────────────────────────────────────────────────────────
  history: {
    list: (
      userId: number,
      params?: {
        problemId?: number;
        success?: boolean;
        language?: Language;
        from?: string;
        to?: string;
      },
    ) => {
      const q = new URLSearchParams();
      if (params?.problemId !== undefined)
        q.set("problemId", String(params.problemId));
      if (params?.success !== undefined)
        q.set("success", String(params.success));
      if (params?.language) q.set("language", params.language);
      if (params?.from) q.set("from", params.from);
      if (params?.to) q.set("to", params.to);
      return req<SolveHistory[]>(
        `/api/users/${userId}/solve-histories${q.size ? `?${q}` : ""}`,
      );
    },
    get: (userId: number, id: number) =>
      req<SolveHistory>(`/api/users/${userId}/solve-histories/${id}`),
    create: (
      userId: number,
      body: {
        problemId: number;
        language: Language;
        success: boolean;
        elapsedTime: number;
        memo?: string;
        solvedAt?: string;
      },
    ) =>
      req<SolveHistory>(`/api/users/${userId}/solve-histories`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    updateMemo: (userId: number, id: number, memo: string) =>
      req<SolveHistory>(`/api/users/${userId}/solve-histories/${id}/memo`, {
        method: "PUT",
        body: JSON.stringify({ memo }),
      }),
    delete: (userId: number, id: number) =>
      req<void>(`/api/users/${userId}/solve-histories/${id}`, {
        method: "DELETE",
      }),
  },

  // ─── Recommend ──────────────────────────────────────────────────────────────
  recommend: {
    list: (userId: number) =>
      req<RecommendProblem[]>(`/api/users/${userId}/problems/recommend`),
  },

  // ─── Timer ──────────────────────────────────────────────────────────────────
  timer: {
    start: (userId: number, problemId: number) =>
      req<TimerStartResponse>("/api/timer/start", {
        method: "POST",
        body: JSON.stringify({ userId, problemId }),
      }),
    stop: (timerKey: string) =>
      req<TimerStopResponse>("/api/timer/stop", {
        method: "POST",
        body: JSON.stringify({ timerKey }),
      }),
  },
};
