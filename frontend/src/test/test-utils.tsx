import { render, type RenderOptions } from "@testing-library/react";
import { ToastProvider } from "../hooks/useToast";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import type { ReactElement } from "react";

function Wrappers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MemoryRouter>
        <ToastProvider>{children}</ToastProvider>
      </MemoryRouter>
    </AuthProvider>
  );
}

function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: Wrappers, ...options });
}

export { renderWithProviders };