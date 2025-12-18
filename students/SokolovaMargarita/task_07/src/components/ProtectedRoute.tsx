import React, { useEffect, ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem("auth") === "true"; // Mock
  useEffect(() => {
    if (!isAuthenticated) {
      // Можно добавить redirect на логин
    }
  }, [isAuthenticated]);
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

export default ProtectedRoute;
