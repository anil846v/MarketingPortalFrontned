import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./assets/styles.css";
import { API_BASE_URL } from "./config";
import { validateUsername, validatePassword } from "./utils/security";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    checkIfLoggedIn();
  }, []);

  const checkIfLoggedIn = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          if (data.role === "ADMIN") {
            navigate("/admin-dashbaord", { replace: true });
          } else if (data.role === "MARKETING") {
            navigate("/marketing-dashboard", { replace: true });
          }else {
            navigate("/", { replace: true });
          }
        }
      }
    } catch (error) {
      // Silently handle - user not logged in
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    // Rate limiting - max 5 attempts
    if (loginAttempts >= 20) {
      setError("Too many login attempts. Please try again later.");
      return;
    }

    setLoading(true);

    try {
      // Validate and sanitize inputs
      const validatedUsername = validateUsername(username);
      const validatedPassword = validatePassword(password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          username: validatedUsername, 
          password: validatedPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginAttempts(0); // Reset on success
        if (data.role === "MARKETING") {
          navigate("/marketing-dashboard", { replace: true });
        } else if (data.role === "ADMIN") {
          navigate("/admin-dashbaord", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setLoginAttempts(prev => prev + 1);
        const errorMessage =
          data.error || "Something went wrong. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-container">
        <div className="form-containerz">
          <h1 className="form-title">Login</h1>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignIn} className="form-content">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="form-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}