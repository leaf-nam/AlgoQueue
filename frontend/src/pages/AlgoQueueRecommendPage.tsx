import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import type { RecommendProblem } from "../types";
import { DiffBadge, PlatformBadge, Loading, Empty, fmtDate, fmtTime } from "../components/shared";
import { useToast } from "../hooks/useToast";
import { getGuestRecommends } from "../lib/guest";

const USER_ID = 1;

export default function AlgoQueueRecommendPage() {
  const navigate = useNavigate();
  const [recommends, setRecommends] = useState<RecommendProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isGuest } = useAuth();

  const load = () => {
    setLoading(true);
    if (isGuest) {
      setRecommends(getGuestRecommends());
      setLoading(false);
    } else {
      api.recommend.list(USER_ID)
        .then(setRecommends)
        .catch((e) => toast(e.message, "error"))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    load();
  }, [isGuest]);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">알고리즘 큐</div>
          <div className="page-subtitle">// ALGORITHM QUEUE</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">⚡ 다음에 풀어야 할 문제</div>
        <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
          실패 또는 15분 초과 풀이 중 오래된 순으로 정렬됩니다. (15분까지 인정)
        </p>
        {loading ? (
          <Loading />
        ) : recommends.length === 0 ? (
          <Empty icon="🎯" message="추천할 문제가 없습니다. 문제를 먼저 등록하세요." />
        ) : (
          <div className="recommend-grid">
            {recommends.map((p) => (
              <div
                className="recommend-card"
                key={p.problemId}
                onClick={() => navigate(`/solve?problemId=${p.problemId}`)}
              >
                <div className="recommend-card-title">{p.title}</div>
                <div className="recommend-card-meta">
                  <PlatformBadge platform={p.platform} />
                  <DiffBadge diff={p.difficulty} />
                  <span className="badge badge-neutral">{p.categoryName}</span>
                  {p.reason && p.reason !== "NEW" && (
                    <span className={`badge ${p.reason === "FAILED" ? "badge-danger" : "badge-accent"}`}>
                      {p.reason === "FAILED" ? "✕ 실패" : "⏱ 초과"}
                    </span>
                  )}
                </div>
                <div className="text-mono text-sm text-muted">
                  #{p.problemNumber}
                  {p.lastSolvedAt && (
                    <span> · {fmtDate(p.lastSolvedAt)}</span>
                  )}
                  {p.lastElapsedTime != null && (
                    <span> · {fmtTime(p.lastElapsedTime)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
