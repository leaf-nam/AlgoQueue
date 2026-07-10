import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { Problem, Language, Category, SolveHistory } from "../types/index";
import { Modal, LANG_LABEL, LangBadge, SuccessBadge, fmtDate, fmtTime } from "../components/shared";
import { useToast } from "../hooks/useToast";

const USER_ID = 1;
const LANGS: Language[] = ["JAVA", "CPP", "PYTHON", "KOTLIN"];

export default function SolvePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [timerProblem, setTP] = useState<number | "">("");
  const intervalRef = useRef<number | undefined>(undefined);
  const submittingRef = useRef(false);

  // Previous solve history for the selected problem
  const [histories, setHistories] = useState<SolveHistory[]>([]);
  const [codeTarget, setCodeTarget] = useState<SolveHistory | null>(null);
  const [codeWarnModal, setCodeWarnModal] = useState(false);
  const [pendingCodeView, setPendingCodeView] = useState<SolveHistory | null>(null);

  // Record Modal (타이머 중지 후 기록용)
  const [recordModal, setRecordModal] = useState(false);
  const [form, setForm] = useState({
    problemId: "" as number | "",
    language: "JAVA" as Language,
    success: true,
    elapsedTime: 0,
    memo: "",
    sourceCode: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      api.problems.list({ hidden: false }),
      api.categories.list(false),
    ]).then(([p, c]) => {
      setProblems(p);
      setCategories(c);
    }).catch((e) => toast(e.message, "error"));

    return () => clearInterval(intervalRef.current);
  }, []);

  // Filter problems by selected category
  const filteredProblems = categoryFilter
    ? problems.filter((p) => p.categoryId === categoryFilter)
    : problems;

  // Fetch history when selected problem changes
  useEffect(() => {
    if (!timerProblem) {
      setHistories([]);
      return;
    }
    api.history.list(USER_ID, { problemId: Number(timerProblem) })
      .then(setHistories)
      .catch((e) => toast(e.message, "error"));
  }, [timerProblem]);

  // Stats derived from histories
  const stats = {
    total: histories.length,
    success: histories.filter((h) => h.success).length,
    fail: histories.filter((h) => !h.success).length,
    avgTime: histories.length
      ? Math.round(histories.reduce((a, h) => a + h.elapsedTime, 0) / histories.length)
      : 0,
  };

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

  const startTimer = (reset = true) => {
    if (!timerProblem) return toast("문제를 선택하세요.", "error");
    if (reset) setElapsed(0);
    setRunning(true);
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    toast("타이머 시작", "success");
  };

  const stopTimer = useCallback(() => {
    if (!running) return;
    clearInterval(intervalRef.current);
    setRunning(false);
    toast("타이머 정지", "info");
  }, [running]);

  const openRecordModal = () => {
    if (running) return;
    const elapsedMinutes = Math.floor(elapsed / 60);
    setForm({
      problemId: Number(timerProblem),
      language: "JAVA",
      success: true,
      elapsedTime: elapsedMinutes,
      memo: "",
      sourceCode: "",
    });
    setRecordModal(true);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
  };

  const submitRecord = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      await api.history.create(USER_ID, {
        problemId: Number(form.problemId),
        language: form.language,
        success: form.success,
        elapsedTime: form.elapsedTime,
        memo: form.memo || undefined,
        sourceCode: form.sourceCode || undefined,
      });
      toast("풀이가 성공적으로 기록되었습니다.", "success");
      setRecordModal(false);
      setTP("");
      setElapsed(0);
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      submittingRef.current = false;
    }
  };

  // ─── View code ─────────────────────────────────────────────────────────────
  const tryViewCode = (h: SolveHistory) => {
    if (running || elapsed > 0) {
      setPendingCodeView(h);
      setCodeWarnModal(true);
    } else {
      setCodeTarget(h);
    }
  };

  const confirmCodeView = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setCodeWarnModal(false);
    if (pendingCodeView) {
      setCodeTarget(pendingCodeView);
      setPendingCodeView(null);
    }
    toast("이번 풀이가 실패 처리되었습니다. 기존 코드를 확인하세요.", "info");
  };

  const cancelCodeView = () => {
    setCodeWarnModal(false);
    setPendingCodeView(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">문제 풀이</div>
          <div className="page-subtitle">// SOLVE PROBLEM</div>
        </div>
      </div>

      {/* ── Timer Widget ── */}
      <div className="timer-widget">
        <div className="timer-label">// SOLVE TIMER</div>
        <div className={`timer-display ${timerClass()}`}>{fmtElapsed()}</div>
        <div className="timer-controls">
          <select
            className="form-select"
            style={{ width: 120 }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value ? Number(e.target.value) : "");
              setTP("");
            }}
            disabled={running}
          >
            <option value="">전체 카테고리</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: 200 }}
            value={timerProblem}
            onChange={(e) =>
              setTP(e.target.value ? Number(e.target.value) : "")
            }
            disabled={running}
          >
            <option value="">문제 선택</option>
            {filteredProblems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
{running ? (
            <>
              <button className="btn btn-danger" onClick={stopTimer}>
                ■ 정지
              </button>
              <span className="timer-pulse" />
            </>
          ) : elapsed > 0 ? (
            <>
              <button className="btn btn-primary" onClick={openRecordModal}>
                기록
              </button>
              <button className="btn btn-ghost" onClick={() => startTimer(false)}>
                ▶ 재시작
              </button>
              <button className="btn btn-ghost" onClick={resetTimer}>
                ↺ 리셋
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => startTimer()}>
              ▶ 시작
            </button>
          )}
        </div>
      </div>

      {/* ── Previous Solve History ── */}
      {timerProblem && (
        <div className="card">
          <div className="card-title">// PAST SOLVES</div>
          <div className="stat-grid" style={{ marginBottom: 16 }}>
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Success</div>
              <div className="stat-value success">{stats.success}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Fail</div>
              <div className="stat-value danger">{stats.fail}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Time</div>
              <div className="stat-value accent">{fmtTime(stats.avgTime)}</div>
            </div>
          </div>
          {histories.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div className="empty-icon">📝</div>
              아직 풀이 기록이 없습니다.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>언어</th>
                    <th>결과</th>
                    <th>시간</th>
                    <th>날짜</th>
                    <th>코드</th>
                  </tr>
                </thead>
                <tbody>
                  {histories.map((h) => (
                    <tr key={h.id}>
                      <td><LangBadge lang={h.language} /></td>
                      <td><SuccessBadge success={h.success} /></td>
                      <td className="text-mono">{fmtTime(h.elapsedTime)}</td>
                      <td className="text-mono text-muted">{fmtDate(h.solvedAt)}</td>
                      <td>
                        {h.sourceCode ? (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => tryViewCode(h)}
                          >
                            코드 보기
                          </button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Code View Warning Modal (타이머 실행 중) ── */}
      {codeWarnModal && (
        <Modal title="⚠️ 기존 코드 확인" onClose={cancelCodeView}>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
            기존 코드를 확인하면
            <br />이번 풀이는 <strong style={{ color: "var(--danger)" }}>실패</strong>로 처리되며 타이머가 종료됩니다.
            <br />계속하시겠습니까?
          </p>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={cancelCodeView}>취소</button>
            <button className="btn btn-danger" onClick={confirmCodeView}>확인</button>
          </div>
        </Modal>
      )}

      {/* ── Code View Modal ── */}
      {codeTarget && (
        <Modal title="풀이 코드" onClose={() => setCodeTarget(null)}>
          <p className="text-muted text-sm" style={{ marginBottom: 4 }}>
            {codeTarget.problemTitle} · {fmtDate(codeTarget.solvedAt)} · {LANG_LABEL[codeTarget.language]}
          </p>
          <pre
            className="form-textarea code-textarea"
            style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "var(--font-mono)" }}
          >{codeTarget.sourceCode}</pre>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setCodeTarget(null)}>
              닫기
            </button>
          </div>
        </Modal>
      )}

      {/* Record Modal (타이머 완료 후 기록 모달) */}
      {recordModal && (
        <Modal title="풀이 결과 기록" onClose={() => setRecordModal(false)}>
          <div className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label">문제</label>
              <select className="form-select" value={form.problemId} disabled>
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
            <div className="form-group">
              <label className="form-label">풀이 코드 (선택)</label>
              <textarea
                className="form-textarea code-textarea"
                value={form.sourceCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sourceCode: e.target.value }))
                }
                placeholder="다른 플랫폼에서 제출한 코드를 붙여넣으세요."
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
                기록 제출
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
