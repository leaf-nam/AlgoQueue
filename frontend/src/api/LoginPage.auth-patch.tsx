/**
 * LoginPage.tsx — auth integration diff
 *
 * 기존 LoginPage.tsx에 아래 내용을 추가/교체하세요.
 * 변경 지점은 3군데입니다.
 */

// ① 상단 import에 추가
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// ② LoginPage 컴포넌트 상단에 추가
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 전에 접근하려 했던 페이지 (없으면 대시보드로)
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  // ③ handleLogin 내부 — API 응답 후 기존 showToast 대신:
  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);

    try {
      // TODO: 실제 API 호출로 교체
      // const res = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: form.email, password: form.password }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message ?? "로그인 실패");

      // ── 임시 Mock 응답 ──
      await new Promise((r) => setTimeout(r, 900));
      const mockUser = { id: 1, email: form.email, nickname: "알고왕" };
      const mockToken = "mock_jwt_token";
      // ─────────────────────

      login(mockUser, mockToken); // AuthContext에 저장
      navigate(from, { replace: true }); // 원래 가려던 페이지로 이동
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "로그인에 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 이하 나머지 코드는 기존과 동일
  // ...
}
