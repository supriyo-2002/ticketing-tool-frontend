
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { tokenStorage } from "../utils/tokenStorage";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const token = tokenStorage.getAccessToken();
  const user = tokenStorage.getUser();
  const expiresAt = tokenStorage.getExpiresAt();

  // A session must contain both a token and a user.
  const hasSession = Boolean(token && user);

  // Check expiration when the API supplies expires_at.
  const isExpired =
    expiresAt !== null &&
    Number.isFinite(expiresAt) &&
    Date.now() >= expiresAt * 1000;

  if (!hasSession || isExpired) {
    if (isExpired) {
      tokenStorage.clearSession();
    }

    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }}
      />
    );
  }

  return children ?? <Outlet />;
}
