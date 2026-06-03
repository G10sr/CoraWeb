import { useState } from "react";

const ADMIN_PASSWORD = "admin123";

const AdminLogin = ({
  isAdmin,
  setIsAdmin,
}) => {
  const [showModal, setShowModal] =
    useState(false);

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);

      setPassword("");
      setError("");
      setShowModal(false);

      return;
    }

    setError("Incorrect password.");
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  return (
    <>
      <section className="admin-controls">

        {!isAdmin ? (
          <button
            className="admin-login-btn"
            onClick={() =>
              setShowModal(true)
            }
          >
            Admin Login
          </button>
        ) : (
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

      </section>

      {showModal && (
        <div className="modal-overlay">

          <div className="admin-modal">

            <h2>Admin Login</h2>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            <div className="modal-buttons">

              <button
                className="save-btn"
                onClick={handleLogin}
              >
                Login
              </button>

              <button
                className="cancel-btn"
                onClick={() => {
                  setShowModal(false);
                  setPassword("");
                  setError("");
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default AdminLogin;