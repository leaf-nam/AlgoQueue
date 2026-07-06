import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { Problem, Language } from "../types/index";
import { Modal, fmtTime, LANG_LABEL } from "../components/shared";
import { useToast } from "../hooks/useToast";

const USER_ID = 1;
const LANGS: Language[] = ["JAVA", "CPP", "PYTHON", "KOTLIN"];

export default function SolvePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [timerKey, setTimerKey] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [timerProblem, setTP] = useState<number | "">("");
  const intervalRef = useRef<number | undefined>(undefined);

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
    // 문제 리스트만 로드
    api.problems
      .list({ hidden: false })
      .then((p) => setProblems(p))
      .catch((e) => toast(e.message, "error"));

    return () => clearInterval(intervalRef.current);
  }, []);

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
      // 풀이 기록 모달 오픈 및 시간 입력 prefilled
      setForm({
        problemId: Number(timerProblem),
        language: "JAVA",
        success: true,
        elapsedTime: res.elapsedMinutes,
        memo: "",
        sourceCode: "",
      });
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

  const submitRecord = async () => {
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
    }
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
      <div className="timer-widget" style={{ marginBottom: "2rem" }}>
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
