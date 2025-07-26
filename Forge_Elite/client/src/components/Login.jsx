// Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { toast } from "react-toastify";
import axios from "axios";
import OAuth from "./OAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post("http://localhost:8000/api/auth/login", {
        email,
        password,
      });

      if (data.success) {
        const { token, userId } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        toast.success("Login Successful 🎉");

        const statusRes = await axios.get("http://localhost:8000/api/user/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { passed, score, lastAttempt } = statusRes.data;
        const now = new Date();
        const last = lastAttempt ? new Date(lastAttempt) : null;
        const diff = last ? now - last : null;

        if (last === null || diff >= 7 * 24 * 60 * 60 * 1000) {
          navigate("/dashboard");
        } else if (passed === false || score === 0) {
          toast.warning("🚫 You were disqualified or need to revisit references.");
          navigate("/reference");
        } else if (passed) {
          toast.info("✅ You have already passed the test.");
          navigate("/");
        }
      } else {
        setError(data.message || "Invalid login credentials");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login.");
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Welcome Back 👋</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="forgot-password">
            <span onClick={() => navigate("/send-reset-otp")}>Forgot Password?</span>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <p style={{ textAlign: 'center' }}>OR</p>
        <OAuth/>
        <p className="register-prompt">
          Not registered? <span onClick={() => navigate("/register")}>Register here</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
