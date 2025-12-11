import { Navigate } from "react-router-dom";

export default function PrivateRouteTurista({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/turista" replace />;
  }

  return children;
}