import { useMemo } from "react";

interface Props {
  data: Record<string, number>;
  year?: number;
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}

function computeStreaks(
  data: Record<string, number>,
  today: Date,
): { current: number; longest: number } {
  const dates = Object.keys(data).filter((d) => data[d] > 0);
  const dateSet = new Set(dates);

  let current = 0;
  let cursor = new Date(today);
  // if today has no solves, start from yesterday
  const todayKey = toDateString(today);
  if (!dateSet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const key = toDateString(cursor);
    if (dateSet.has(key)) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  let longest = 0;
  let streak = 0;
  const sorted = [...dates].sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        streak = 1;
      }
    }
    if (streak > longest) longest = streak;
  }

  return { current, longest };
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ContributionGraph({ data, year }: Props) {
  const today = new Date();
  const targetYear = year ?? today.getFullYear();

  const cells = useMemo(() => {
    const start = new Date(targetYear, 0, 1);
    const end = new Date(targetYear + 1, 0, 0); // last day of target year
    const result: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4; dayOfWeek: number; weekIndex: number }[] = [];

    const cursor = new Date(start);
    while (cursor <= end) {
      const dateStr = toDateString(cursor);
      const count = data[dateStr] ?? 0;
      result.push({
        date: dateStr,
        count,
        level: getLevel(count),
        dayOfWeek: cursor.getDay(),
        weekIndex: Math.floor((cursor.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }, [data, targetYear]);

  const totalCount = useMemo(
    () => Object.values(data).reduce((a, b) => a + b, 0),
    [data],
  );

  const streaks = useMemo(() => computeStreaks(data, today), [data, today]);

  // Group cells by week index
  const weeks = useMemo(() => {
    const map = new Map<number, typeof cells>();
    for (const cell of cells) {
      const w = cell.weekIndex;
      if (!map.has(w)) map.set(w, []);
      map.get(w)!.push(cell);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [cells]);

  // Month labels: show month when first day of month is in that week
  const monthLabels = useMemo(() => {
    const labels: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;
    for (const [weekIdx, weekCells] of weeks) {
      for (const cell of weekCells) {
        const month = new Date(cell.date).getMonth();
        if (month !== lastMonth) {
          labels.push({ weekIndex: weekIdx, label: MONTH_LABELS[month] });
          lastMonth = month;
        }
      }
    }
    return labels;
  }, [weeks]);

  return (
    <div className="contribution-graph">
      <div className="contribution-header">
        <span className="contribution-total">
          {totalCount} contributions in {targetYear}
        </span>
        <span className="contribution-streaks">
          <span className="streak-item">
            🔥 <strong>{streaks.current}</strong> day streak
          </span>
          <span className="streak-item">
            🏆 <strong>{streaks.longest}</strong> longest streak
          </span>
        </span>
      </div>

      <div className="contribution-grid-wrap">
        {/* Month labels */}
        <div className="cg-months">
          <div className="cg-spacer" />
          {monthLabels.map((m) => (
            <span
              key={m.weekIndex}
              className="cg-month-label"
              style={{ gridColumn: m.weekIndex + 2 }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="cg-body">
          {/* Day labels */}
          <div className="cg-day-labels">
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="cg-day-label">
                {label}
              </span>
            ))}
          </div>

          {/* Cells grid */}
          <div className="cg-cells">
            {weeks.map(([weekIdx, weekCells]) => (
              <div key={weekIdx} className="cg-week">
                {[0, 1, 2, 3, 4, 5, 6].map((dow) => {
                  const cell = weekCells.find((c) => c.dayOfWeek === dow);
                  if (!cell) return <div key={dow} className="cg-cell empty" />;
                  return (
                    <div
                      key={cell.date}
                      className={`cg-cell level-${cell.level}`}
                      title={`${cell.date}: ${cell.count} solve${cell.count !== 1 ? "s" : ""}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="contribution-footer">
        <span className="cg-legend-label">Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`cg-cell level-${l}`} />
        ))}
        <span className="cg-legend-label">More</span>
      </div>

      <style>{`
        .contribution-graph {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-secondary);
        }
        .contribution-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .contribution-total {
          font-size: 13px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .contribution-streaks {
          display: flex;
          gap: 16px;
          font-size: 12px;
        }
        .streak-item strong {
          color: var(--text-primary);
        }
        .contribution-grid-wrap {
          overflow-x: auto;
        }
        .cg-months {
          display: flex;
          gap: 2px;
          margin-left: 28px;
          margin-bottom: 2px;
        }
        .cg-spacer {
          width: 0;
        }
        .cg-month-label {
          font-size: 10px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .cg-body {
          display: flex;
          gap: 2px;
        }
        .cg-day-labels {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-top: 0;
        }
        .cg-day-label {
          font-size: 10px;
          color: var(--text-muted);
          height: 10px;
          line-height: 10px;
          margin-bottom: 2px;
        }
        .cg-cells {
          display: flex;
          gap: 2px;
        }
        .cg-week {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cg-cell {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          background: var(--border);
        }
        .cg-cell.level-0 { background: var(--border); }
        .cg-cell.level-1 { background: #0d4429; }
        .cg-cell.level-2 { background: #1b6e3a; }
        .cg-cell.level-3 { background: #2ea043; }
        .cg-cell.level-4 { background: #56d364; }
        .cg-cell.empty { background: transparent; }
        .contribution-footer {
          display: flex;
          align-items: center;
          gap: 3px;
          justify-content: flex-end;
          margin-top: 8px;
        }
        .cg-legend-label {
          font-size: 10px;
          color: var(--text-muted);
          margin: 0 2px;
        }
      `}</style>
    </div>
  );
}
