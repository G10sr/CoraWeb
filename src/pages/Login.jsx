import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import logo from "../assets/img/CoraLogo.png";
import "../assets/styles/Login.css";

const VALID_USER = "Alvaro";
const VALID_PASSWORD = "Alvaro123";

// helper simple (sin ProtectedRoute)
function isAuthenticated() {
  return localStorage.getItem("user") !== null;
}

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const username = formData.username.trim();
    const password = formData.password;

    if (username === VALID_USER && password === VALID_PASSWORD) {
      // 🔥 guardamos usuario en "sesión"
      localStorage.setItem(
        "user",
        JSON.stringify({
          username,
          id: "local-user"
        })
      );

      navigate("/");
    } else {
      setError("Credenciales incorrectas. Intentalo de nuevo.");
    }

    setLoading(false);
  };

  return (
    <div className="login-page page-transition">

      <main className="login-main">
        <div className="login-card">
          <div className="login-card-header">
            <img src={logo} alt="Cora Web" className="login-logo" />
            <h1 className="login-title nature-title">Bienvenido</h1>
            <p className="login-subtitle">
              Inicia sesion para explorar Cora Web
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="login-error">{error}</p>}

            <div className="login-input-group">
              <label>Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Tu usuario"
              />
            </div>

            <div className="login-input-group">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Tu contraseña"
              />
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        <p>
          &copy; {new Date().getFullYear()} Cora Web
        </p>
      </footer>
    </div>
  );
}