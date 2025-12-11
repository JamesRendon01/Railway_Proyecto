import { Navigate } from "react-router-dom";

export default function PrivateRouteAdmin({ children }) {
  const tokenAdmin = localStorage.getItem("token_admin");

  if (!tokenAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}