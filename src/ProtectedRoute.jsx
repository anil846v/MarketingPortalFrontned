import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authFetch } from "./utils/authFetch";
import { API_BASE_URL } from "./config";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let intervalId;

    const checkAuth = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/auth/validate`, { method: "POST" });
        const data = await res.json();

        if (requiredRole && data.role !== requiredRole) {
          setAllowed(false);
          return;
        }

        setAllowed(true);
      } catch {
        setAllowed(false);
      }
    };

    const handleSessionExpired = () => setAllowed(false);
    window.addEventListener("session-expired", handleSessionExpired);

    checkAuth();
    intervalId = setInterval(checkAuth, 2 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [requiredRole]);

  if (allowed === null) return <div>Checking session...</div>;
  if (!allowed) return <Navigate to="/login?session=expired" replace />;

  return children;
};

export default ProtectedRoute;