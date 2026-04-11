import { Navigate } from "react-router";
import { useAuth } from "@/features/auth/lib/useAuth";

function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuth } = useAuth();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
