import { Navigate } from "react-router-dom";

const AUTH_KEY = "coraAuth";

export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function setAuthenticated(value) {
  if (value) {
    sessionStorage.setItem(AUTH_KEY, "true");
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
