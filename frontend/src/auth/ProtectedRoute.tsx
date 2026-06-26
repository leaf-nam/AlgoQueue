import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Wraps protected routes.
 *
 * Usage in App.tsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/" element={<DashboardPage />} />
 *     ...
 *   </Route>
 *
 * - While session is being restored from localStorage, renders nothing
 *   (prevents a flash-redirect to /login on hard refresh).
 * - After restore: if no user → redirect to /login, preserving the
 *   intended destination so we can return after login.
 */
export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Wait for session restore before making a routing decision
  if (isLoading) return null;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }} // LoginPage reads this to redirect back
        replace
      />
    );
  }

  return <Outlet />;
}
