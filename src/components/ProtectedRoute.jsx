import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: "200px 0", textAlign: "center" }}>
        <div className="loader">
          <div className="loader__spinner" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/prihlaseni" replace />;
  }

  return children;
}
