import { Navigate } from "react-router";

import { useAuth } from "@/features/auth/lib/useAuth";

function PublicOnlyRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuth } = useAuth();

  if (isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
