type AuthCallback = (reason: string) => void;
let onUnauthenticatedCallback: AuthCallback | null = null;

export const authEvent = {
  subscribe(callback: AuthCallback) {
    onUnauthenticatedCallback = callback;
  },
  emitUnauthenticated(reason: string = "인증이 필요합니다.") {
    if (onUnauthenticatedCallback) {
      onUnauthenticatedCallback(reason);
    }
  },
};
