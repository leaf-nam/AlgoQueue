import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { RecommendProblem } from "../types";
import { DiffBadge, PlatformBadge, Loading, Empty } from "../components/shared";
import { useToast } from "../hooks/useToast";

const USER_ID = 1;

export default function AlgoQueueRecommendPage() {
  const navigate = useNavigate();
  const [recommends, setRecommends] = useState<RecommendProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    api.recommend.list(USER_ID)
      .then(setRecommends)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
                </div>
                <div className="text-mono text-sm text-muted">
                  #{p.problemNumber}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}