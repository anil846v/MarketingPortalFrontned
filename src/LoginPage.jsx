import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./assets/styles.css";
import { API_BASE_URL } from "./config";
import { validateUsername, validatePassword } from "./utils/security";
import Logo from "./assets/GeniusMindsLogo.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
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
          setIsSuccess(true);
          setTimeout(() => {
            if (data.role === "ADMIN") {
              navigate("/admin-dashbaord", { replace: true });
            } else if (data.role === "MARKETING") {
              navigate("/marketing-dashboard", { replace: true });
            } else {
              navigate("/", { replace: true });
            }
          }, 800);
        }
      }
    } catch (error) {
      // Silently handle - user not logged in
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    // Rate limiting - max 20 attempts
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
        setLoginAttempts(0);
        setIsSuccess(true);

        // Brief delay for the "WOW" transition effect
        setTimeout(() => {
          if (data.role === "MARKETING") {
            navigate("/marketing-dashboard", { replace: true });
          } else if (data.role === "ADMIN") {
            navigate("/admin-dashbaord", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 1000);
      } else {
        setLoginAttempts(prev => prev + 1);
        const errorMessage = data.error || "Invalid credentials. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(err.message || "Unexpected error occurred");
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="page-layout">
        <div style={{ textAlign: 'center' }}>
          <div className="success-check-wrapper">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#00abe4" strokeWidth="3" className="success-animate">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ color: '#1a2b3c', marginTop: '20px', fontWeight: '700' }}>Welcome Back!</h2>
          <p style={{ color: '#5c728a' }}>Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <div className="page-container">
        <div className="brand-section">
          <img src={Logo} alt="Genius Minds Logo" className="logo-img" />
          <h1 className="brand-name">Genius Minds Making Code</h1>
          <p className="brand-subtitle">Marketing Portal Login</p>
        </div>
        <div className="form-container">
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