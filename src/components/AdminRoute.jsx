import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: "200px 0", textAlign: "center" }}>
        <div className="loader">
          <div className="loader__spinner" />
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
