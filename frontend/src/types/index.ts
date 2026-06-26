// ─── Enums ────────────────────────────────────────────────────────────────────
export type Platform =
  | "PROGRAMMERS"
  | "CODE_TREE"
  | "LEETCODE"
  | "HACKERRANK"
  | "CODEFORCES"
  | "ATCODER"
  | "CODEWARS"
  | "SWEXPERT";

export type Language = "JAVA" | "CPP" | "PYTHON" | "KOTLIN";

export type Difficulty = "VERY_EASY" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD";

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  createdAt: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  hidden: boolean;
  problemCount: number;
}

// ─── Problem ──────────────────────────────────────────────────────────────────
export interface Problem {
  id: number;
  platform: Platform;
  problemNumber: string;
  title: string;
  url: string;
  difficulty: Difficulty | null;
  categoryId: number;
  categoryName: string;
  hidden: boolean;
  createdAt: string;
}

// ─── ProblemSetting ───────────────────────────────────────────────────────────
export interface ProblemSetting {
  id: number;
  userId: number;
  problemId: number;
  platform: Platform;
  problemNumber: string;
  problemTitle: string;
  categoryName: string;
  language: Language;
  targetTime: number;
  difficulty: Difficulty | null;
  createdAt: string;
}

// ─── SolveHistory ─────────────────────────────────────────────────────────────
export interface SolveHistory {
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
  solvedAt: string;
}

// ─── Recommend ────────────────────────────────────────────────────────────────
export interface RecommendProblem {
  problemId: number;
  platform: Platform;
  problemNumber: string;
  title: string;
  difficulty: Difficulty | null;
  categoryName: string;
}

// ─── Timer ────────────────────────────────────────────────────────────────────
export interface TimerStartResponse {
  timerKey: string;
  userId: number;
  problemId: number;
  startedAt: string;
}

export interface TimerStopResponse {
  userId: number;
  problemId: number;
  startedAt: string;
  stoppedAt: string;
  elapsedMinutes: number;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  nickname: string;
}

export interface SignupRequest {
  email: string;
  nickname: string;
  password: string;
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}
