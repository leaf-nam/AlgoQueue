import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import type {
  SolveHistory,
  Problem,
  Language,
  Difficulty,
} from "../types/index";
import {
  DiffBadge,
  LangBadge,
  SuccessBadge,
  Loading,
  Empty,
  Modal,
  ConfirmModal,
  fmtDate,
  fmtTime,
  LANG_LABEL,
} from "../components/shared";
import { useToast } from "../hooks/useToast";

const USER_ID = 1;
const LANGS: Language[] = ["JAVA", "CPP", "PYTHON", "KOTLIN"];
const DIFFS: Difficulty[] = [
  "VERY_EASY",
  "EASY",
  "MEDIUM",
  "HARD",
  "VERY_HARD",
];
const DIFF_LABEL = {
  VERY_EASY: "Very Easy",
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  VERY_HARD: "Very Hard",
};

export default function HistoryPage() {
  const [histories, setHistories] = useState<SolveHistory[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSuccess, setFS] = useState<"" | "true" | "false">("");
  const [filterLang, setFL] = useState<Language | "">("");

  // Timer state
  const [timerKey, setTimerKey] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [timerProblem, setTP] = useState<number | "">("");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Modals
  const [recordModal, setRecordModal] = useState(false);
  const [memoTarget, setMemoTarget] = useState<SolveHistory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SolveHistory | null>(null);

  const [form, setForm] = useState({
    problemId: "" as number | "",
    language: "JAVA" as Language,
    success: true,
    elapsedTime: 0,
    memo: "",
    difficulty: "" as Difficulty | "",
  });
  const [newMemo, setNewMemo] = useState("");
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.history.list(USER_ID, {
        success: filterSuccess !== "" ? filterSuccess === "true" : undefined,
        language: filterLang || undefined,
      }),
      api.problems.list({ hidden: false }),
    ])
      .then(([h, p]) => {
        setHistories(h);
        setProblems(p);
      })
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterSuccess, filterLang]);

  // ─── Timer logic ────────────────────────────────────────────────────────────
  const timerClass = () => {
    const min = elapsed / 60;
    if (min >= 60) return "danger";
    if (min >= 30) return "warn";
    return "";
  };

  const fmtElapsed = () => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return h > 0
      ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const startTimer = async () => {
    if (!timerProblem) return toast("문제를 선택하세요.", "error");
    try {
      const res = await api.timer.start(USER_ID, Number(timerProblem));
      setTimerKey(res.timerKey);
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      toast("타이머 시작", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const stopTimer = async () => {
    if (!timerKey) return;
    clearInterval(intervalRef.current);
    try {
      const res = await api.timer.stop(timerKey);
      setTimerKey(null);
      // 풀이 기록 모달 오픈 with elapsed prefilled
      setForm((f) => ({
        ...f,
        problemId: Number(timerProblem),
        elapsedTime: res.elapsedMinutes,
      }));
      setRecordModal(true);
      toast(`풀이 시간: ${fmtTime(res.elapsedMinutes)}`, "info");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimerKey(null);
    setElapsed(0);
  };

  // ─── Record submit ───────────────────────────────────────────────────────────
  const submitRecord = async () => {
    try {
      await api.history.create(USER_ID, {
        problemId: Number(form.problemId),
        language: form.language,
        success: form.success,
        elapsedTime: form.elapsedTime,
        memo: form.memo || undefined,
      });
      toast("풀이가 기록되었습니다.", "success");
      setRecordModal(false);
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const submitMemo = async () => {
    if (!memoTarget) return;
    try {
      await api.history.updateMemo(USER_ID, memoTarget.id, newMemo);
      toast("회고가 수정되었습니다.", "success");
      setMemoTarget(null);
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const doDelete = async (h: SolveHistory) => {
    try {
      await api.history.delete(USER_ID, h.id);
      toast("삭제되었습니다.", "success");
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">풀이 이력</div>
          <div className="page-subtitle">// SOLVE HISTORY</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm({
              problemId: "",
              language: "JAVA",
              success: true,
              elapsedTime: 0,
              memo: "",
              difficulty: "",
            });
            setRecordModal(true);
          }}
        >
          + 풀이 기록
        </button>
      </div>

      {/* ── Timer Widget ── */}
      <div className="timer-widget">
        <div className="timer-label">// SOLVE TIMER</div>
        <div className={`timer-display ${timerClass()}`}>{fmtElapsed()}</div>
        <div className="timer-controls">
          <select
            className="form-select"
            style={{ width: 220 }}
            value={timerProblem}
            onChange={(e) =>
              setTP(e.target.value ? Number(e.target.value) : "")
            }
            disabled={!!timerKey}
          >
            <option value="">문제 선택</option>
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {!timerKey ? (
            <button className="btn btn-primary" onClick={startTimer}>
              ▶ 시작
            </button>
          ) : (
            <>
              <button className="btn btn-danger" onClick={stopTimer}>
                ■ 정지 & 기록
              </button>
              <button className="btn btn-ghost" onClick={resetTimer}>
                ↺ 리셋
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={filterSuccess}
          onChange={(e) => setFS(e.target.value as any)}
        >
          <option value="">전체 결과</option>
          <option value="true">성공</option>
          <option value="false">실패</option>
        </select>
        <select
          className="form-select"
          value={filterLang}
          onChange={(e) => setFL(e.target.value as any)}
        >
          <option value="">전체 언어</option>
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {LANG_LABEL[l]}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loading />
        ) : histories.length === 0 ? (
          <Empty icon="📝" message="풀이 이력이 없습니다." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>문제</th>
                  <th>언어</th>
                  <th>결과</th>
                  <th>시간</th>
                  <th>날짜</th>
                  <th>회고</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {histories.map((h) => (
                  <tr key={h.id}>
                    <td className="primary">{h.problemTitle}</td>
                    <td>
                      <LangBadge lang={h.language} />
                    </td>
                    <td>
                      <SuccessBadge success={h.success} />
                    </td>
                    <td className="text-mono">{fmtTime(h.elapsedTime)}</td>
                    <td className="text-mono text-muted">
                      {fmtDate(h.solvedAt)}
                    </td>
                    <td
                      className="text-muted"
                      style={{
                        maxWidth: 180,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h.memo ?? (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-icon btn-sm"
                          title="회고 수정"
                          onClick={() => {
                            setMemoTarget(h);
                            setNewMemo(h.memo ?? "");
                          }}
                        >
                          ✎
                        </button>
                        <button
                          className="btn btn-icon btn-sm"
                          title="삭제"
                          onClick={() => setDeleteTarget(h)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Modal */}
      {recordModal && (
        <Modal title="풀이 기록" onClose={() => setRecordModal(false)}>
          <div className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label">문제</label>
              <select
                className="form-select"
                value={form.problemId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, problemId: Number(e.target.value) }))
                }
              >
                <option value="">선택</option>
                {problems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">언어</label>
                <select
                  className="form-select"
                  value={form.language}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      language: e.target.value as Language,
                    }))
                  }
                >
                  {LANGS.map((l) => (
                    <option key={l} value={l}>
                      {LANG_LABEL[l]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">풀이 시간 (분)</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={form.elapsedTime}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      elapsedTime: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">결과</label>
              <div className="flex gap-2">
                <button
                  className={`btn ${form.success ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setForm((f) => ({ ...f, success: true }))}
                >
                  ✓ 성공
                </button>
                <button
                  className={`btn ${!form.success ? "btn-danger" : "btn-ghost"}`}
                  onClick={() => setForm((f) => ({ ...f, success: false }))}
                >
                  ✕ 실패
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">회고 (선택)</label>
              <textarea
                className="form-textarea"
                value={form.memo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, memo: e.target.value }))
                }
                placeholder="풀이 후 느낀 점, 개선할 점..."
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setRecordModal(false)}
              >
                취소
              </button>
              <button className="btn btn-primary" onClick={submitRecord}>
                기록
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Memo Edit Modal */}
      {memoTarget && (
        <Modal title="회고 수정" onClose={() => setMemoTarget(null)}>
          <p className="text-muted text-sm">{memoTarget.problemTitle}</p>
          <textarea
            className="form-textarea"
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            rows={5}
          />
          <div className="form-actions">
            <button
              className="btn btn-ghost"
              onClick={() => setMemoTarget(null)}
            >
              취소
            </button>
            <button className="btn btn-primary" onClick={submitMemo}>
              저장
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.problemTitle}" 풀이 이력을 삭제하시겠습니까?`}
          onConfirm={() => doDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
