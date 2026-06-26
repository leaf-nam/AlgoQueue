import { useState, useEffect, useRef } from "react";
import "../Styles/Login.css";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
type ModalType = "signup" | "forgot" | "verify" | null;
type VerifyContext = "signup" | "forgot";

interface FormState {
  email: string;
  password: string;
  nickname: string;
  confirmPassword: string;
  verifyCode: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface FieldError {
  email?: string;
  password?: string;
  nickname?: string;
  confirmPassword?: string;
  verifyCode?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  general?: string;
}

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────
const INITIAL_FORM: FormState = {
  email: "",
  password: "",
  nickname: "",
  confirmPassword: "",
  verifyCode: "",
  newPassword: "",
  confirmNewPassword: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
const VERIFY_EXPIRY_SEC = 180;

// ────────────────────────────────────────────────────────────
// Hook – countdown timer
// ────────────────────────────────────────────────────────────
function useCountdown(active: boolean, seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setRemaining(seconds);
      if (ref.current) clearInterval(ref.current);
      return;
    }
    setRemaining(seconds);
    ref.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (ref.current) clearInterval(ref.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [active, seconds]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return { remaining, display: `${mm}:${ss}`, expired: remaining === 0 };
}

// ────────────────────────────────────────────────────────────
// Cursor blink component
// ────────────────────────────────────────────────────────────
function TerminalCursor() {
  return <span className="aq-cursor" aria-hidden />;
}

// ────────────────────────────────────────────────────────────
// Password strength indicator
// ────────────────────────────────────────────────────────────
function PasswordStrength({ pw }: { pw: string }) {
  if (!pw) return null;

  const checks = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /\d/.test(pw),
    /[@$!%*#?&]/.test(pw),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "취약", "보통", "양호", "강함"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22d3ee"];

  return (
    <div className="aq-pw-strength">
      <div className="aq-pw-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aq-pw-bar"
            style={{
              background: i <= score ? colors[score] : "var(--aq-border)",
            }}
          />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontSize: 11, color: colors[score] }}>
          {labels[score]}
        </span>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Input field wrapper
// ────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  suffix?: React.ReactNode;
}

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  maxLength,
  suffix,
}: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="aq-field">
      <label htmlFor={id} className="aq-label">
        {label}
      </label>
      <div className="aq-input-wrap">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`aq-input${error ? " aq-input--err" : ""}`}
          aria-describedby={error ? `${id}-err` : undefined}
          aria-invalid={!!error}
        />
        {isPassword && (
          <button
            type="button"
            className="aq-eye"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {show ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
        {suffix && <div className="aq-input-suffix">{suffix}</div>}
      </div>
      {error && (
        <p id={`${id}-err`} className="aq-field-err" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Modal backdrop
// ────────────────────────────────────────────────────────────
function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="aq-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="aq-modal">
        <button className="aq-modal-close" onClick={onClose} aria-label="닫기">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Signup modal
// ────────────────────────────────────────────────────────────
function SignupModal({
  onClose,
  onVerify,
}: {
  onClose: () => void;
  onVerify: (email: string) => void;
}) {
  const [form, setForm] = useState<
    Pick<FormState, "email" | "password" | "confirmPassword" | "nickname">
  >({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: FieldError = {};
    if (!form.email) e.email = "이메일을 입력하세요.";
    else if (!EMAIL_RE.test(form.email))
      e.email = "올바른 이메일 형식이 아닙니다.";
    if (!form.nickname.trim()) e.nickname = "닉네임을 입력하세요.";
    else if (form.nickname.length < 2)
      e.nickname = "닉네임은 2자 이상이어야 합니다.";
    if (!form.password) e.password = "비밀번호를 입력하세요.";
    else if (!PW_RE.test(form.password))
      e.password = "영문·숫자·특수문자 포함 8자 이상이어야 합니다.";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "비밀번호가 일치하지 않습니다.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    // TODO: API call – POST /api/auth/signup
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    onVerify(form.email);
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="aq-modal-title">
        <span className="aq-accent">//</span> 계정 만들기
      </h2>
      <p className="aq-modal-sub">AlgoQueue에 오신 걸 환영합니다.</p>

      <Field
        label="이메일"
        id="su-email"
        type="email"
        value={form.email}
        onChange={set("email")}
        error={errors.email}
        placeholder="dev@example.com"
        autoComplete="email"
      />
      <Field
        label="닉네임"
        id="su-nick"
        value={form.nickname}
        onChange={set("nickname")}
        error={errors.nickname}
        placeholder="알고왕"
        maxLength={20}
      />
      <Field
        label="비밀번호"
        id="su-pw"
        type="password"
        value={form.password}
        onChange={set("password")}
        error={errors.password}
        placeholder="영문·숫자·특수문자 포함 8자 이상"
        autoComplete="new-password"
      />
      <PasswordStrength pw={form.password} />
      <Field
        label="비밀번호 확인"
        id="su-pw2"
        type="password"
        value={form.confirmPassword}
        onChange={set("confirmPassword")}
        error={errors.confirmPassword}
        placeholder="비밀번호를 다시 입력하세요"
        autoComplete="new-password"
      />

      {errors.general && (
        <p className="aq-general-err" role="alert">
          {errors.general}
        </p>
      )}

      <button
        className="aq-btn aq-btn--primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <span className="aq-spinner" aria-label="처리 중" />
        ) : (
          "이메일 인증 코드 받기"
        )}
      </button>

      <p className="aq-modal-footer">
        이미 계정이 있으신가요?{" "}
        <button className="aq-link" onClick={onClose}>
          로그인
        </button>
      </p>
    </Modal>
  );
}

// ────────────────────────────────────────────────────────────
// Email verification modal (signup + forgot shared)
// ────────────────────────────────────────────────────────────
function VerifyModal({
  email,
  context,
  onClose,
  onComplete,
}: {
  email: string;
  context: VerifyContext;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(true);

  const timer = useCountdown(sent, VERIFY_EXPIRY_SEC);

  const resend = async () => {
    setSent(false);
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setCode("");
    setErrors({});
  };

  const handleSubmit = async () => {
    const e: FieldError = {};
    if (!code || code.length < 6)
      e.verifyCode = "6자리 인증 코드를 입력하세요.";
    if (context === "forgot") {
      if (!newPw) e.newPassword = "새 비밀번호를 입력하세요.";
      else if (!PW_RE.test(newPw))
        e.newPassword = "영문·숫자·특수문자 포함 8자 이상이어야 합니다.";
      if (newPw !== confirmPw)
        e.confirmNewPassword = "비밀번호가 일치하지 않습니다.";
    }
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    // TODO: API call – POST /api/auth/verify or /api/auth/reset-password
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onComplete();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="aq-modal-title">
        <span className="aq-accent">//</span>{" "}
        {context === "signup" ? "이메일 인증" : "비밀번호 재설정"}
      </h2>
      <p className="aq-modal-sub">
        <span className="aq-mono">{email}</span>으로 전송된 인증 코드를
        입력하세요.
      </p>

      <div className="aq-field">
        <label htmlFor="vc-code" className="aq-label">
          인증 코드
        </label>
        <div className="aq-input-wrap">
          <input
            id="vc-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className={`aq-input aq-input--code${errors.verifyCode ? " aq-input--err" : ""}`}
            aria-describedby={errors.verifyCode ? "vc-code-err" : undefined}
          />
          <div className="aq-input-suffix">
            {timer.expired ? (
              <button className="aq-link aq-link--inline" onClick={resend}>
                재전송
              </button>
            ) : (
              <span
                className="aq-timer"
                style={{ color: timer.remaining < 30 ? "#ef4444" : undefined }}
              >
                {timer.display}
              </span>
            )}
          </div>
        </div>
        {errors.verifyCode && (
          <p id="vc-code-err" className="aq-field-err" role="alert">
            {errors.verifyCode}
          </p>
        )}
      </div>

      {context === "forgot" && (
        <>
          <Field
            label="새 비밀번호"
            id="vc-npw"
            type="password"
            value={newPw}
            onChange={setNewPw}
            error={errors.newPassword}
            placeholder="영문·숫자·특수문자 포함 8자 이상"
            autoComplete="new-password"
          />
          <PasswordStrength pw={newPw} />
          <Field
            label="새 비밀번호 확인"
            id="vc-npw2"
            type="password"
            value={confirmPw}
            onChange={setConfirmPw}
            error={errors.confirmNewPassword}
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
          />
        </>
      )}

      {errors.general && (
        <p className="aq-general-err" role="alert">
          {errors.general}
        </p>
      )}

      <button
        className="aq-btn aq-btn--primary"
        onClick={handleSubmit}
        disabled={loading || timer.expired}
      >
        {loading ? (
          <span className="aq-spinner" aria-label="처리 중" />
        ) : context === "signup" ? (
          "인증 완료 · 가입하기"
        ) : (
          "비밀번호 변경"
        )}
      </button>

      <button className="aq-btn aq-btn--ghost" onClick={onClose}>
        취소
      </button>
    </Modal>
  );
}

// ────────────────────────────────────────────────────────────
// Forgot password modal
// ────────────────────────────────────────────────────────────
function ForgotModal({
  onClose,
  onVerify,
}: {
  onClose: () => void;
  onVerify: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("이메일을 입력하세요.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }
    setError("");
    setLoading(true);
    // TODO: API call – POST /api/auth/forgot-password
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onVerify(email);
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="aq-modal-title">
        <span className="aq-accent">//</span> 비밀번호 찾기
      </h2>
      <p className="aq-modal-sub">
        가입 시 사용한 이메일을 입력하면 인증 코드를 보내드립니다.
      </p>

      <Field
        label="이메일"
        id="fp-email"
        type="email"
        value={email}
        onChange={setEmail}
        error={error}
        placeholder="dev@example.com"
        autoComplete="email"
      />

      <button
        className="aq-btn aq-btn--primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <span className="aq-spinner" aria-label="처리 중" />
        ) : (
          "인증 코드 전송"
        )}
      </button>

      <button className="aq-btn aq-btn--ghost" onClick={onClose}>
        로그인으로 돌아가기
      </button>
    </Modal>
  );
}

// ────────────────────────────────────────────────────────────
// Toast notification
// ────────────────────────────────────────────────────────────
function Toast({
  message,
  type,
  onDone,
}: {
  message: string;
  type: "success" | "error";
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`aq-toast aq-toast--${type}`}
      role="status"
      aria-live="polite"
    >
      {type === "success" ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main LoginPage
// ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [form, setForm] = useState<Pick<FormState, "email" | "password">>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [verifyCtx, setVerifyCtx] = useState<{
    email: string;
    context: VerifyContext;
  } | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ msg, type });

  const validate = () => {
    const e: FieldError = {};
    if (!form.email) e.email = "이메일을 입력하세요.";
    else if (!EMAIL_RE.test(form.email))
      e.email = "올바른 이메일 형식이 아닙니다.";
    if (!form.password) e.password = "비밀번호를 입력하세요.";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    // TODO: API call – POST /api/auth/login
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    // TODO: redirect to dashboard on success
    showToast("로그인 성공! 대시보드로 이동합니다.", "success");
  };

  const openSignup = () => setModal("signup");
  const openForgot = () => setModal("forgot");
  const closeModal = () => {
    setModal(null);
    setVerifyCtx(null);
  };

  const onSignupVerify = (email: string) => {
    setModal(null);
    setVerifyCtx({ email, context: "signup" });
  };

  const onForgotVerify = (email: string) => {
    setModal(null);
    setVerifyCtx({ email, context: "forgot" });
  };

  const onVerifyComplete = () => {
    const ctx = verifyCtx;
    setVerifyCtx(null);
    if (ctx?.context === "signup") {
      showToast("회원가입 완료! 로그인해 주세요.", "success");
    } else {
      showToast("비밀번호가 변경되었습니다.", "success");
    }
  };

  return (
    <>
      {/* Background grid canvas */}
      <div className="aq-root" aria-label="AlgoQueue 로그인">
        <div className="aq-grid-bg" aria-hidden />

        {/* Logo area */}
        <div className="aq-logo-area">
          <span className="aq-logo-bracket">[</span>
          <span className="aq-logo-text">AlgoQueue</span>
          <span className="aq-logo-bracket">]</span>
          <TerminalCursor />
        </div>

        {/* Tagline */}
        <p className="aq-tagline">
          코딩 테스트 풀이를 자동으로 기록하고 분석하세요.
        </p>

        {/* Login card */}
        <div className="aq-card">
          <div className="aq-card-header">
            <span className="aq-card-tag">LOGIN</span>
            <div className="aq-card-dots" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          </div>

          <Field
            label="이메일"
            id="login-email"
            type="email"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            placeholder="dev@example.com"
            autoComplete="email"
          />
          <Field
            label="비밀번호"
            id="login-pw"
            type="password"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {errors.general && (
            <p className="aq-general-err" role="alert">
              {errors.general}
            </p>
          )}

          <div className="aq-forgot-row">
            <button className="aq-link" onClick={openForgot}>
              비밀번호를 잊으셨나요?
            </button>
          </div>

          <button
            className="aq-btn aq-btn--primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="aq-spinner" aria-label="로그인 중" />
            ) : (
              "로그인"
            )}
          </button>

          <div className="aq-divider">
            <span>계정이 없으신가요?</span>
          </div>

          <button className="aq-btn aq-btn--secondary" onClick={openSignup}>
            회원가입
          </button>
        </div>

        {/* Version tag */}
        <p className="aq-version">AlgoQueue v0.1.0 · © 2025</p>
      </div>

      {/* Modals */}
      {modal === "signup" && (
        <SignupModal onClose={closeModal} onVerify={onSignupVerify} />
      )}
      {modal === "forgot" && (
        <ForgotModal onClose={closeModal} onVerify={onForgotVerify} />
      )}
      {verifyCtx && (
        <VerifyModal
          email={verifyCtx.email}
          context={verifyCtx.context}
          onClose={() => setVerifyCtx(null)}
          onComplete={onVerifyComplete}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </>
  );
}
