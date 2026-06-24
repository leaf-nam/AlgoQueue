import type { Difficulty, Platform, Language } from "../types/index";

// ─── Label maps ───────────────────────────────────────────────────────────────
export const PLATFORM_LABEL: Record<Platform, string> = {
  PROGRAMMERS: "Programmers",
  CODE_TREE: "CodeTree",
  LEETCODE: "LeetCode",
  HACKERRANK: "HackerRank",
  CODEFORCES: "Codeforces",
  ATCODER: "AtCoder",
  CODEWARS: "Codewars",
  SWEXPERT: "SW Expert",
};

export const LANG_LABEL: Record<Language, string> = {
  JAVA: "Java",
  CPP: "C++",
  PYTHON: "Python",
  KOTLIN: "Kotlin",
};

export const DIFF_LABEL: Record<Difficulty, string> = {
  VERY_EASY: "Very Easy",
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  VERY_HARD: "Very Hard",
};

// ─── Badge components ─────────────────────────────────────────────────────────
export function DiffBadge({ diff }: { diff: Difficulty | null }) {
  if (!diff) return <span className="badge badge-neutral">—</span>;
  return <span className={`badge diff-${diff}`}>{DIFF_LABEL[diff]}</span>;
}

export function SuccessBadge({ success }: { success: boolean }) {
  return success ? (
    <span className="badge badge-success">✓ Pass</span>
  ) : (
    <span className="badge badge-danger">✕ Fail</span>
  );
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  return <span className="badge badge-accent">{PLATFORM_LABEL[platform]}</span>;
}

export function LangBadge({ lang }: { lang: Language }) {
  return <span className="badge badge-neutral">{LANG_LABEL[lang]}</span>;
}

// ─── Loading / Empty ──────────────────────────────────────────────────────────
export function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      Loading...
    </div>
  );
}

export function Empty({
  icon = "📭",
  message,
}: {
  icon?: string;
  message: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      {message}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Confirm delete ───────────────────────────────────────────────────────────
export function ConfirmModal({
  message,
  onConfirm,
  onClose,
}: {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="확인" onClose={onClose}>
      <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{message}</p>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>
          취소
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          삭제
        </button>
      </div>
    </Modal>
  );
}

// ─── Util ─────────────────────────────────────────────────────────────────────
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
}

export function fmtTime(min: number) {
  if (min < 60) return `${min}분`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}
