type AuthCallback = () => void;
let onUnauthenticatedCallback: AuthCallback | null = null;

export const authEvent = {
  // 403 발생 시 호출할 함수 등록
  subscribe(callback: AuthCallback) {
    onUnauthenticatedCallback = callback;
  },
  // 403 발생 시 실행
  emitUnauthenticated() {
    if (onUnauthenticatedCallback) {
      onUnauthenticatedCallback();
    }
  },
};
