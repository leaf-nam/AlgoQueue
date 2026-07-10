type AuthCallback = (reason: string) => void;
let onUnauthenticatedCallback: AuthCallback | null = null;
let emitted = false;

export const authEvent = {
  subscribe(callback: AuthCallback) {
    onUnauthenticatedCallback = callback;
    emitted = false;
  },
  emitUnauthenticated(reason: string = "인증이 필요합니다.") {
    if (emitted || !onUnauthenticatedCallback) return;
    emitted = true;
    onUnauthenticatedCallback(reason);
  },
  reset() {
    emitted = false;
  },
};
