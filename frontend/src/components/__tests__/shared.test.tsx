import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Modal, ConfirmModal, fmtTime, fmtDate, DiffBadge, SuccessBadge, LangBadge } from "../shared";

describe("fmtTime", () => {
  it('returns "0분" for 0', () => {
    expect(fmtTime(0)).toBe("0분");
  });

  it("returns minutes only for < 60", () => {
    expect(fmtTime(30)).toBe("30분");
    expect(fmtTime(59)).toBe("59분");
  });

  it("returns hours and minutes for >= 60", () => {
    expect(fmtTime(60)).toBe("1h 0m");
    expect(fmtTime(90)).toBe("1h 30m");
    expect(fmtTime(150)).toBe("2h 30m");
  });
});

describe("fmtDate", () => {
  it("formats ISO date to ko-KR short format", () => {
    const result = fmtDate("2026-07-09T12:00:00");
    expect(result).toContain("26");
    expect(result).toContain("7");
    expect(result).toContain("9");
  });
});

describe("Modal", () => {
  it("renders title and children", () => {
    render(
      <Modal title="테스트 모달" onClose={() => {}}>
        <p>내용입니다</p>
      </Modal>,
    );
    expect(screen.getByText("테스트 모달")).toBeInTheDocument();
    expect(screen.getByText("내용입니다")).toBeInTheDocument();
  });

  it("fires onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal title="모달" onClose={onClose}>
        <p>내용</p>
      </Modal>,
    );
    screen.getByText("내용").click();
    expect(onClose).not.toHaveBeenCalled(); // stopPropagation

    screen.getByText("✕").click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("ConfirmModal", () => {
  it("fires onConfirm when 삭제 is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal message="정말 삭제?" onConfirm={onConfirm} onClose={() => {}} />,
    );
    screen.getByText("삭제").click();
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

describe("DiffBadge", () => {
  it('renders — for null', () => {
    render(<DiffBadge diff={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders difficulty label", () => {
    render(<DiffBadge diff="HARD" />);
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });
});

describe("SuccessBadge", () => {
  it("renders Pass for true", () => {
    render(<SuccessBadge success={true} />);
    expect(screen.getByText("✓ Pass")).toBeInTheDocument();
  });

  it("renders Fail for false", () => {
    render(<SuccessBadge success={false} />);
    expect(screen.getByText("✕ Fail")).toBeInTheDocument();
  });
});

describe("LangBadge", () => {
  it("renders language label", () => {
    render(<LangBadge lang="JAVA" />);
    expect(screen.getByText("Java")).toBeInTheDocument();
  });
});