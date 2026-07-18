import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { Category } from "../types/index";
import { Loading, Empty, Modal, ConfirmModal } from "../components/shared";
import { useToast } from "../hooks/useToast";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    api.categories
      .list(showHidden ? undefined : false)
      .then(setCategories)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [showHidden]);

  const submit = async () => {
    try {
      if (modal === "create") {
        await api.categories.create(name);
        toast("카테고리가 생성되었습니다.", "success");
      } else if (editing) {
        await api.categories.update(editing.id, name);
        toast("카테고리가 수정되었습니다.", "success");
      }
      setModal(null);
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const toggleHidden = async (c: Category) => {
    try {
      await api.categories.toggleHidden(c.id);
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const doDelete = async (c: Category) => {
    try {
      await api.categories.delete(c.id);
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
          <div className="page-title">카테고리</div>
          <div className="page-subtitle">// CATEGORY MANAGEMENT</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setName("");
            setEditing(null);
            setModal("create");
          }}
        >
          + 카테고리 추가
        </button>
      </div>

      <div className="filter-bar">
        <label className="flex items-center gap-2 text-sm text-muted">
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
        ) : categories.length === 0 ? (
          <Empty icon="🏷️" message="카테고리가 없습니다." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>문제 수</th>
                  <th>상태</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} style={{ opacity: c.hidden ? 0.5 : 1 }}>
                    <td className="primary">
                      <span
                        style={{ cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => navigate(`/problems?categoryId=${c.id}`)}
                      >
                        {c.name}
                      </span>
                    </td>
                    <td className="text-mono">{c.problemCount}</td>
                    <td>
                      {c.hidden ? (
                        <span className="badge badge-neutral">숨김</span>
                      ) : (
                        <span className="badge badge-success">표시</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-icon btn-sm"
                          onClick={() => {
                            setName(c.name);
                            setEditing(c);
                            setModal("edit");
                          }}
                        >
                          ✎
                        </button>
                        <button
                          className="btn btn-icon btn-sm"
                          onClick={() => toggleHidden(c)}
                        >
                          {c.hidden ? "👁" : "🙈"}
                        </button>
                        <button
                          className="btn btn-icon btn-sm"
                          onClick={() => setDeleteTarget(c)}
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

      {modal && (
        <Modal
          title={modal === "create" ? "카테고리 추가" : "카테고리 수정"}
          onClose={() => setModal(null)}
        >
          <div className="form-group">
            <label className="form-label">카테고리명</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: DP, BFS, 구현..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>
              취소
            </button>
            <button className="btn btn-primary" onClick={submit}>
              저장
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.name}" 카테고리를 삭제하시겠습니까? 연결된 문제가 있으면 삭제되지 않습니다.`}
          onConfirm={() => doDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
