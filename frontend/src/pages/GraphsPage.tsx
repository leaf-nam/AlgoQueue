import { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import type { SolveHistory, Problem, Category, Platform, Difficulty } from "../types";
import { PLATFORM_LABEL, Loading, Empty } from "../components/shared";
import { useToast } from "../hooks/useToast";

const USER_ID = 1;

const DIFF_LABEL: Record<string, string> = {
  VERY_EASY: "Very Easy",
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  VERY_HARD: "Very Hard",
};

const DIFF_ORDER: Difficulty[] = ["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"];

const PERIODS = [
  { key: "1M", label: "1개월", days: 30 },
  { key: "3M", label: "3개월", days: 90 },
  { key: "6M", label: "6개월", days: 180 },
  { key: "1Y", label: "1년", days: 365 },
] as const;

type Period = (typeof PERIODS)[number]["key"];

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthLabel(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function dayLabel(d: Date): string {
  return `${String(d.getMonth() + 1)}/${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Simple horizontal bar ──────────────────────────────────────────────────
function Bar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="graph-bar-row">
      <span className="graph-bar-label">{label}</span>
      <div className="graph-bar-track">
        <div className="graph-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="graph-bar-value">{count}</span>
    </div>
  );
}

export default function GraphsPage() {
  const [histories, setHistories] = useState<SolveHistory[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [period, setPeriod] = useState<Period>("3M");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      api.history.list(USER_ID),
      api.problems.list(),
      api.categories.list(),
    ])
      .then(([h, p, c]) => {
        setHistories(h);
        setProblems(p);
        setCategories(c);
      })
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  // Build problem lookup maps
  const problemMap = useMemo(() => {
    const map = new Map<number, Problem>();
    for (const p of problems) map.set(p.id, p);
    return map;
  }, [problems]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  // ─── Daily solves (filtered by period) ─────────────────────────────────────
  const dailyData = useMemo(() => {
    const cutoff = new Date();
    const periodObj = PERIODS.find((p) => p.key === period)!;
    cutoff.setDate(cutoff.getDate() - periodObj.days);

    const solveDates = histories
      .filter((h) => new Date(h.solvedAt) >= cutoff)
      .map((h) => h.solvedAt.slice(0, 10));

    const countMap = new Map<string, number>();
    for (const d of solveDates) {
      countMap.set(d, (countMap.get(d) ?? 0) + 1);
    }

    // Fill all dates in range
    const result: { date: string; label: string; count: number }[] = [];
    const cursor = new Date(cutoff);
    const today = new Date();
    while (cursor <= today) {
      const key = fmtDate(cursor);
      result.push({
        date: key,
        label: dayLabel(cursor),
        count: countMap.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }, [histories, period]);

  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);

  // ─── Difficulty breakdown ──────────────────────────────────────────────────
  const diffData = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const h of histories) {
      const prob = problemMap.get(h.problemId);
      const diff = prob?.difficulty ?? "unknown";
      countMap.set(diff, (countMap.get(diff) ?? 0) + 1);
    }
    return DIFF_ORDER.map((d) => ({
      key: d,
      label: DIFF_LABEL[d],
      count: countMap.get(d) ?? 0,
      color:
        d === "VERY_EASY"
          ? "#2ecc71"
          : d === "EASY"
            ? "#34d399"
            : d === "MEDIUM"
              ? "#ffa502"
              : d === "HARD"
                ? "#ff4757"
                : "#ff2d55",
    }));
  }, [histories, problemMap]);

  const diffTotal = diffData.reduce((a, b) => a + b.count, 0);

  // ─── Category breakdown ────────────────────────────────────────────────────
  const catData = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const h of histories) {
      const catName = h.categoryName || categoryNameMap.get(h.problemId) || "기타";
      countMap.set(catName, (countMap.get(catName) ?? 0) + 1);
    }
    return Array.from(countMap.entries())
      .map(([label, count]) => ({ label, count, color: "var(--accent)" }))
      .sort((a, b) => b.count - a.count);
  }, [histories, categoryNameMap]);

  const catTotal = catData.reduce((a, b) => a + b.count, 0);

  // ─── Platform breakdown ────────────────────────────────────────────────────
  const platData = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const h of histories) {
      countMap.set(h.platform, (countMap.get(h.platform) ?? 0) + 1);
    }
    return Array.from(countMap.entries())
      .map(([key, count]) => ({
        label: PLATFORM_LABEL[key as Platform] ?? key,
        count,
        color: "var(--accent)",
      }))
      .sort((a, b) => b.count - a.count);
  }, [histories]);

  const platTotal = platData.reduce((a, b) => a + b.count, 0);

  // ─── Monthly trend (all time) ──────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const h of histories) {
      const m = monthLabel(new Date(h.solvedAt));
      countMap.set(m, (countMap.get(m) ?? 0) + 1);
    }
    return Array.from(countMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [histories]);

  const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);

  if (loading) return <Loading />;

  if (histories.length === 0) {
    return (
      <>
        <div className="page-header">
          <div>
            <div className="page-title">그래프</div>
            <div className="page-subtitle">// STATISTICS & CHARTS</div>
          </div>
        </div>
        <Empty icon="📊" message="풀이 기록이 없습니다. 문제를 풀고 나면 그래프가 표시됩니다." />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">그래프</div>
          <div className="page-subtitle">// STATISTICS & CHARTS</div>
        </div>
      </div>

      {/* ── Daily Solves ── */}
      <div className="card">
        <div className="card-title">📅 일별 풀이 수</div>
        <div className="graph-period-selector">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={`btn btn-sm ${period === p.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {dailyData.length === 0 ? (
          <Empty icon="📅" message="선택한 기간에 풀이 기록이 없습니다." />
        ) : (
          <div className="graph-bar-chart" style={{ height: 150 }}>
            {dailyData.map((d) => (
              <div
                key={d.date}
                className="graph-bar-column"
                title={`${d.date}: ${d.count} solve${d.count !== 1 ? "s" : ""}`}
              >
                <div className="graph-bar-col-spacer" />
                <div
                  className="graph-bar-col-fill"
                  style={{ height: Math.max(2, (d.count / maxDaily) * 130) }}
                />
                {dailyData.length <= 62 && (
                  <span className="graph-bar-col-label">{d.label}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Stats Grid ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">총 풀이</div>
          <div className="stat-value accent">{histories.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">성공</div>
          <div className="stat-value success">{histories.filter((h) => h.success).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">실패</div>
          <div className="stat-value danger">{histories.filter((h) => !h.success).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">성공률</div>
          <div
            className="stat-value"
            style={{
              color:
                histories.length > 0
                  ? histories.filter((h) => h.success).length / histories.length >= 0.7
                    ? "var(--success)"
                    : "var(--warn)"
                  : "var(--text-muted)",
            }}
          >
            {histories.length > 0
              ? Math.round((histories.filter((h) => h.success).length / histories.length) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="graph-grid-2">
        {/* Difficulty */}
        <div className="card">
          <div className="card-title">🎯 난이도 분포</div>
          {diffTotal === 0 ? (
            <Empty icon="🎯" message="데이터 없음" />
          ) : (
            diffData.map((d) => (
              <Bar key={d.key} label={d.label} count={d.count} total={diffTotal} color={d.color} />
            ))
          )}
        </div>

        {/* Platform */}
        <div className="card">
          <div className="card-title">💻 플랫폼 분포</div>
          {platTotal === 0 ? (
            <Empty icon="💻" message="데이터 없음" />
          ) : (
            platData.map((d) => (
              <Bar key={d.label} label={d.label} count={d.count} total={platTotal} color={d.color} />
            ))
          )}
        </div>
      </div>

      {/* ── Category breakdown ── */}
      <div className="card">
        <div className="card-title">📂 유형(카테고리) 분포</div>
        {catTotal === 0 ? (
          <Empty icon="📂" message="데이터 없음" />
        ) : (
          catData.map((d) => (
            <Bar key={d.label} label={d.label} count={d.count} total={catTotal} color={d.color} />
          ))
        )}
      </div>

      {/* ── Monthly Trend ── */}
      <div className="card">
        <div className="card-title">📈 월별 추이</div>
        {monthlyData.length === 0 ? (
          <Empty icon="📈" message="데이터 없음" />
        ) : (
          <div className="graph-bar-chart" style={{ height: 150 }}>
            {monthlyData.map((m) => (
              <div key={m.label} className="graph-bar-column" title={`${m.label}: ${m.count} solves`}>
                <div className="graph-bar-col-spacer" />
                <div
                  className="graph-bar-col-fill"
                  style={{ height: Math.max(2, (m.count / maxMonthly) * 130) }}
                />
                <span className="graph-bar-col-label">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .graph-period-selector {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
        }
        .graph-bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          padding-top: 8px;
          overflow-x: auto;
        }
        .graph-bar-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          min-width: 6px;
          height: 100%;
        }
        .graph-bar-col-spacer {
          flex: 1;
        }
        .graph-bar-col-fill {
          width: 100%;
          min-width: 4px;
          max-width: 20px;
          background: var(--accent);
          border-radius: 2px 2px 0 0;
          flex-shrink: 0;
        }
        .graph-bar-col-fill:hover {
          opacity: 0.8;
        }
        .graph-bar-col-label {
          font-size: 8px;
          color: var(--text-muted);
          margin-top: 2px;
          white-space: nowrap;
          transform: rotate(-45deg);
          transform-origin: top left;
        }
        .graph-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .graph-bar-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .graph-bar-label {
          width: 80px;
          font-size: 12px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .graph-bar-track {
          flex: 1;
          height: 16px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }
        .graph-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
          min-width: 2px;
        }
        .graph-bar-value {
          width: 32px;
          text-align: right;
          font-size: 12px;
          font-family: var(--font-mono);
          color: var(--text-primary);
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
}
