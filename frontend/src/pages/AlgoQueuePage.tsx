import { useEffect, useState } from "react";
import { api } from "../api";
import type { SolveHistory, Problem, Language } from "../types/index";
import {
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

export default function AlgoQueuePage() {
  const [histories, setHistories] = useState<SolveHistory[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSuccess, setFS] = useState<"" | "true" | "false">("");
  const [filterLang, setFL] = useState<Language | "">("");

  // Modals
  const [recordModal, setRecordModal] = useState(false);
  const [memoTarget, setMemoTarget] = useState<SolveHistory | null>(null);
  const [codeTarget, setCodeTarget] = useState<SolveHistory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SolveHistory | null>(null);

  const [form, setForm] = useState({
    problemId: "" as number | "",
    language: "JAVA" as Language,
    success: true,
    elapsedTime: 0,
    memo: "",
    sourceCode: "",
  });
  const [newMemo, setNewMemo] = useState("");
  const [newCode, setNewCode] = useState("");
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
      toast("풀이가 기록되었습니다.", "success");
      setRecordModal(false);
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const submitCode = async () => {
    if (!codeTarget) return;
    try {
      await api.history.updateCode(USER_ID, codeTarget.id, newCode);
      toast("풀이 코드가 저장되었습니다.", "success");
      setCodeTarget(null);
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const copyCode = async () => {
    if (!newCode) return;
    try {
      await navigator.clipboard.writeText(newCode);
      toast("코드를 복사했습니다.", "success");
    } catch {
      toast("브라우저에서 클립보드 접근을 허용하지 않았습니다.", "error");
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
          <div className="page-title">알고리즘 큐 / 이력</div>
          <div className="page-subtitle">// ALGO QUEUE & HISTORY</div>
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
              sourceCode: "",
            });
            setRecordModal(true);
          }}
        >
          + 풀이 기록
        </button>
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
                  <th>코드</th>
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
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setCodeTarget(h);
                          setNewCode(h.sourceCode ?? "");
                        }}
                      >
                        {h.sourceCode ? "보기" : "저장"}
                      </button>
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

      {codeTarget && (
        <Modal title="풀이 코드" onClose={() => setCodeTarget(null)}>
          <p className="text-muted text-sm">{codeTarget.problemTitle}</p>
          <textarea
            className="form-textarea code-textarea"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="다른 플랫폼에서 제출한 코드를 붙여넣으세요."
          />
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={copyCode}>
              복사
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setCodeTarget(null)}
            >
              취소
            </button>
            <button className="btn btn-primary" onClick={submitCode}>
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
