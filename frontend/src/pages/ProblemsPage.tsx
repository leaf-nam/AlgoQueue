import { useEffect, useState } from "react";
import { api } from "../api";
import type { Problem, Category, Platform, Difficulty } from "../types";
import {
  DiffBadge,
  PlatformBadge,
  Loading,
  Empty,
  Modal,
  ConfirmModal,
  fmtDate,
  PLATFORM_LABEL,
} from "../components/shared";
import { useToast } from "../hooks/useToast";

const PLATFORMS: Platform[] = [
  "PROGRAMMERS",
  "CODE_TREE",
  "LEETCODE",
  "HACKERRANK",
  "CODEFORCES",
  "ATCODER",
  "CODEWARS",
  "SWEXPERT",
];
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

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFP] = useState<Platform | "">("");
  const [filterCat, setFC] = useState<number | "">("");
  const [showHidden, setShowHidden] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Problem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Problem | null>(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const { toast } = useToast();

  const [form, setForm] = useState({
    platform: "" as Platform | "",
    problemNumber: "",
    title: "",
    url: "",
    difficulty: "" as Difficulty | "",
    categoryId: "" as number | "",
    hidden: false,
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.problems.list({
        platform: filterPlatform || undefined,
        categoryId: filterCat || undefined,
        hidden: showHidden ? undefined : false,
      }),
      api.categories.list(),
    ])
      .then(([p, c]) => {
        setProblems(p);
        setCategories(c);
      })
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterPlatform, filterCat, showHidden]);

  const openCreate = () => {
    setForm({
      platform: "",
      problemNumber: "",
      title: "",
      url: "",
      difficulty: "",
      categoryId: "",
      hidden: false,
    });
    setEditing(null);
    setShowNewCat(false);
    setNewCatName("");
    setModal("create");
  };

  const openEdit = (p: Problem) => {
    setForm({
      platform: p.platform,
      problemNumber: p.problemNumber,
      title: p.title,
      url: p.url,
      difficulty: p.difficulty ?? "",
      categoryId: p.categoryId,
      hidden: p.hidden,
    });
    setEditing(p);
    setModal("edit");
  };

  const submit = async () => {
    try {
      if (modal === "create") {
        await api.problems.create({
          platform: form.platform as Platform,
          problemNumber: form.problemNumber,
          title: form.title,
          url: form.url,
          difficulty: (form.difficulty as Difficulty) || undefined,
          categoryId: Number(form.categoryId),
          hidden: form.hidden,
        });
        toast("문제가 등록되었습니다.", "success");
      } else if (editing) {
        await api.problems.update(editing.id, {
          title: form.title,
          url: form.url,
          difficulty: (form.difficulty as Difficulty) || undefined,
          categoryId: Number(form.categoryId),
        });
        toast("문제가 수정되었습니다.", "success");
      }
      setModal(null);
      setShowNewCat(false);
      setNewCatName("");
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const toggleHidden = async (p: Problem) => {
    try {
      await api.problems.toggleHidden(p.id);
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const createCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    try {
      const cat = await api.categories.create(name);
      setCategories((prev) => [...prev, cat]);
      setForm((f) => ({ ...f, categoryId: cat.id }));
      setNewCatName("");
      setShowNewCat(false);
      toast("카테고리가 추가되었습니다.", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const doDelete = async (p: Problem) => {
    try {
      await api.problems.delete(p.id);
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
          <div className="page-title">문제 목록</div>
          <div className="page-subtitle">// PROBLEM REGISTRY</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + 문제 등록
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={filterPlatform}
          onChange={(e) => setFP(e.target.value as any)}
        >
          <option value="">전체 플랫폼</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABEL[p]}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={filterCat}
          onChange={(e) => setFC(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label
          className="flex items-center gap-2 text-sm text-muted"
          style={{ marginLeft: "auto" }}
        >
          숨김 포함
          <label className="toggle">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            <span className="toggle-track" />
            <span className="toggle-thumb" />
          </label>
        </label>
      </div>

      <div className="card">
        {loading ? (
          <Loading />
        ) : problems.length === 0 ? (
          <Empty icon="📚" message="등록된 문제가 없습니다." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>플랫폼</th>
                  <th>카테고리</th>
                  <th>난이도</th>
                  <th>등록일</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p.id} style={{ opacity: p.hidden ? 0.5 : 1 }}>
                    <td className="text-mono text-muted">#{p.problemNumber}</td>
                    <td className="primary">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-underline"
                      >
                        {p.title}
                      </a>
                      {p.hidden && (
                        <span
                          className="badge badge-neutral"
                          style={{ marginLeft: 6 }}
                        >
                          숨김
                        </span>
                      )}
                    </td>
                    <td>
                      <PlatformBadge platform={p.platform} />
                    </td>
                    <td className="text-muted">{p.categoryName}</td>
                    <td>
                      <DiffBadge diff={p.difficulty} />
                    </td>
                    <td className="text-mono text-muted">
                      {fmtDate(p.createdAt)}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-icon btn-sm"
                          title="수정"
                          onClick={() => openEdit(p)}
                        >
                          ✎
                        </button>
                        <button
                          className="btn btn-icon btn-sm"
                          title={p.hidden ? "표시" : "숨김"}
                          onClick={() => toggleHidden(p)}
                        >
                          {p.hidden ? "👁" : "🙈"}
                        </button>
                        <button
                          className="btn btn-icon btn-sm"
                          title="삭제"
                          onClick={() => setDeleteTarget(p)}
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

      {/* Create / Edit Modal */}
      {modal && (
        <Modal
          title={modal === "create" ? "문제 등록" : "문제 수정"}
          onClose={() => {
            setModal(null);
            setShowNewCat(false);
            setNewCatName("");
          }}
        >
          <div className="flex flex-col gap-3">
            {modal === "create" && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">플랫폼</label>
                  <select
                    className="form-select"
                    value={form.platform}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        platform: e.target.value as Platform,
                      }))
                    }
                  >
                    <option value="">선택</option>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {PLATFORM_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">문제 번호</label>
                  <input
                    className="form-input"
                    value={form.problemNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, problemNumber: e.target.value }))
                    }
                    placeholder="1234"
                  />
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">문제명</label>
              <input
                className="form-input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="문제 제목"
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL</label>
              <input
                className="form-input"
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="문제 URL"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">카테고리</label>
                <div className="flex gap-2">
                  <select
                    className="form-select"
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        categoryId: Number(e.target.value),
                      }))
                    }
                  >
                    <option value="">선택</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-icon btn-sm"
                    title="새 카테고리 추가"
                    onClick={() => setShowNewCat(true)}
                    style={{ flexShrink: 0 }}
                  >
                    +
                  </button>
                </div>
                {showNewCat && (
                  <div className="flex gap-2" style={{ marginTop: 6 }}>
                    <input
                      className="form-input"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") createCategory();
                        if (e.key === "Escape") {
                          setShowNewCat(false);
                          setNewCatName("");
                        }
                      }}
                      placeholder="새 카테고리명"
                      autoFocus
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={createCategory}
                    >
                      추가
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setShowNewCat(false);
                        setNewCatName("");
                      }}
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">난이도 (공식)</label>
                <select
                  className="form-select"
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      difficulty: e.target.value as Difficulty,
                    }))
                  }
                >
                  <option value="">미지정</option>
                  {DIFFS.map((d) => (
                    <option key={d} value={d}>
                      {DIFF_LABEL[d]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                취소
              </button>
              <button className="btn btn-primary" onClick={submit}>
                저장
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.title}" 문제를 삭제하시겠습니까?`}
          onConfirm={() => doDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
