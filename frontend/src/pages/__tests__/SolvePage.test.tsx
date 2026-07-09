import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import SolvePage from "../SolvePage";
import { api } from "../../api";

vi.mock("../../api", () => ({
  api: {
    problems: {
      list: vi.fn(),
    },
    history: {
      create: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.clearAllMocks();
  vi.mocked(api.problems.list).mockResolvedValue([
    { id: 1, title: "Two Sum", platform: "LEETCODE", problemNumber: "1", url: "", difficulty: null, categoryId: 1, categoryName: "Array", hidden: false, createdAt: "2026-01-01" },
    { id: 2, title: "Valid Parentheses", platform: "LEETCODE", problemNumber: "20", url: "", difficulty: "EASY", categoryId: 2, categoryName: "Stack", hidden: false, createdAt: "2026-01-01" },
  ]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SolvePage - Timer", () => {
  it("renders timer widget with start button", async () => {
    renderWithProviders(<SolvePage />);
    expect(screen.getByText("// SOLVE TIMER")).toBeInTheDocument();
    expect(screen.getByText("▶ 시작")).toBeInTheDocument();
  });

  it("loads problems on mount", async () => {
    renderWithProviders(<SolvePage />);
    expect(api.problems.list).toHaveBeenCalledWith({ hidden: false });
  });

  it("shows problem options in select", async () => {
    renderWithProviders(<SolvePage />);
    expect(await screen.findByText("Two Sum")).toBeInTheDocument();
    expect(await screen.findByText("Valid Parentheses")).toBeInTheDocument();
  });

  it("starts and stops timer", async () => {
    renderWithProviders(<SolvePage />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });
    fireEvent.click(screen.getByText("▶ 시작"));
    expect(await screen.findByText("■ 정지")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(3000); });
    fireEvent.click(screen.getByText("■ 정지"));
    expect(screen.getByText("기록")).toBeInTheDocument();
    expect(screen.getByText("↺ 리셋")).toBeInTheDocument();
  });

  it("shows 재시작 button after stopping", async () => {
    renderWithProviders(<SolvePage />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });
    fireEvent.click(screen.getByText("▶ 시작"));
    expect(await screen.findByText("■ 정지")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByText("■ 정지"));
    expect(screen.getByText("▶ 재시작")).toBeInTheDocument();
  });

  it("opens record modal when 기록 is clicked", async () => {
    renderWithProviders(<SolvePage />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });
    fireEvent.click(screen.getByText("▶ 시작"));
    expect(await screen.findByText("■ 정지")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByText("■ 정지"));
    fireEvent.click(screen.getByText("기록"));
    expect(screen.getByText("풀이 결과 기록")).toBeInTheDocument();
    expect(screen.getByText("기록 제출")).toBeInTheDocument();
  });

  it("submits record and closes modal", async () => {
    vi.mocked(api.history.create).mockResolvedValue({} as any);
    renderWithProviders(<SolvePage />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });
    fireEvent.click(screen.getByText("▶ 시작"));
    expect(await screen.findByText("■ 정지")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByText("■ 정지"));
    fireEvent.click(screen.getByText("기록"));
    fireEvent.click(screen.getByText("기록 제출"));
    expect(api.history.create).toHaveBeenCalledWith(1, expect.objectContaining({
      problemId: 1,
      language: "JAVA",
    }));
  });

  it("resets timer when 리셋 is clicked", async () => {
    renderWithProviders(<SolvePage />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });
    fireEvent.click(screen.getByText("▶ 시작"));
    expect(await screen.findByText("■ 정지")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByText("■ 정지"));
    fireEvent.click(screen.getByText("↺ 리셋"));
    expect(screen.getByText("▶ 시작")).toBeInTheDocument();
  });

  it("shows error toast when start is clicked with no problem selected", async () => {
    renderWithProviders(<SolvePage />);
    fireEvent.click(screen.getByText("▶ 시작"));
    expect(await screen.findByText("문제를 선택하세요.")).toBeInTheDocument();
  });
});