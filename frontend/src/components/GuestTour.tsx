import { useState } from "react";
import { markGuestTourDone } from "../lib/guest";

const steps = [
  {
    title: "🧭 AlgoQueue 둘러보기",
    desc: "게스트로 체험해보세요! 아래 메뉴들을 간단히 소개합니다.",
  },
  {
    title: "💻 문제 풀이",
    desc: "타이머를 켜고 문제를 풀어보세요. 풀이 시간을 기록하고 히스토리를 확인할 수 있습니다.",
  },
  {
    title: "⭐ 알고리즘 큐",
    desc: "아직 풀지 않았거나 다시 풀어볼 문제를 추천해드려요. 실패했거나 오래 걸린 문제를 우선으로 보여줍니다.",
  },
  {
    title: "📋 풀이 이력",
    desc: "지금까지 풀었던 모든 문제의 기록을 확인할 수 있습니다.",
  },
  {
    title: "📊 그래프",
    desc: "풀이 통계를 그래프로 확인하세요. 일별/주별 풀이 현황을 한눈에 볼 수 있습니다.",
  },
  {
    title: "📝 문제 / 카테고리",
    desc: "등록된 문제와 카테고리를 관리합니다. (게스트 모드에서는 샘플 데이터만 제공됩니다)",
  },
  {
    title: "⚙️ 설정",
    desc: "문제별 목표 시간, 언어 등을 설정할 수 있습니다. (게스트 모드에서는 제한됩니다)",
  },
];

export default function GuestTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const handleDone = () => {
    markGuestTourDone();
    onDone();
  };

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 12,
          padding: 32,
          maxWidth: 460,
          width: "90%",
          color: "#e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {step + 1} / {steps.length}
          </span>
          <button
            onClick={handleDone}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 12,
            color: "#f1f5f9",
          }}
        >
          {s.title}
        </h2>

        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cbd5e1", marginBottom: 24 }}>
          {s.desc}
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid #475569",
                background: "transparent",
                color: "#e2e8f0",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              이전
            </button>
          )}
          {isLast ? (
            <button
              onClick={handleDone}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              시작하기
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              다음
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
