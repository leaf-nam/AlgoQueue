import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { RecommendProblem, SolveHistory } from "../types";
import {
  DiffBadge,
  PlatformBadge,
  SuccessBadge,
  Loading,
  Empty,
  fmtDate,
  fmtTime,
} from "../components/shared";
import { useToast } from "../hooks/useToast";

const USER_ID = 1; // TODO: auth 연동 후 교체

export default function DashboardPage() {
  const navigate = useNavigate();
  const [recommends, setRecommends] = useState<RecommendProblem[]>([]);
  const [recent, setRecent] = useState<SolveHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pass: 0, fail: 0 });
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([api.recommend.list(USER_ID), api.history.list(USER_ID)])
      .then(([rec, hist]) => {
        setRecommends(rec);
        setRecent(hist.slice(0, 10));
        setStats({
          total: hist.length,
          pass: hist.filter((h) => h.success).length,
          fail: hist.filter((h) => !h.success).length,
        });
      })
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const passRate = stats.total
    ? Math.round((stats.pass / stats.total) * 100)
    : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">대시보드</div>
          <div className="page-subtitle">
            // SOLVE HISTORY & RECOMMENDATIONS
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">총 풀이</div>
          <div className="stat-value accent">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">성공</div>
          <div className="stat-value success">{stats.pass}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">실패</div>
          <div className="stat-value danger">{stats.fail}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">성공률</div>
          <div
            className="stat-value"
            style={{ color: passRate >= 70 ? "var(--success)" : "var(--warn)" }}
          >
            {passRate}%
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="card-title">⚡ 다음 풀어야 할 문제</div>
        {recommends.length === 0 ? (
          <Empty
            icon="🎯"
            message="추천할 문제가 없습니다. 문제를 먼저 등록하세요."
          />
        ) : (
          <div className="recommend-grid">
            {recommends.map((p) => (
              <div
                className="recommend-card"
                key={p.problemId}
                style={{ cursor: "pointer" }}
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

      {/* Recent history */}
      <div className="card">
        <div className="card-title">📋 최근 풀이 이력</div>
        {recent.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {recent.map((h) => (
                  <tr key={h.id}>
                    <td
                      className="primary"
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => navigate(`/solve?problemId=${h.problemId}`)}
                    >
                      {h.problemTitle}
                    </td>
                    <td>
                      <span className="badge badge-neutral">{h.language}</span>
                    </td>
                    <td>
                      <SuccessBadge success={h.success} />
                    </td>
                    <td className="text-mono">{fmtTime(h.elapsedTime)}</td>
                    <td className="text-mono text-muted">
                      {fmtDate(h.solvedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
