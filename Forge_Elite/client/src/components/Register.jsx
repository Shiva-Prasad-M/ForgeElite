import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import axios from "axios";
import { toast } from "react-toastify";
import OAuth from "./OAuth";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const { data } = await axios.post("http://localhost:8000/api/auth/register", {
        name,
        email,
        password
      });
  
      if (data.success) {
        toast.info("Registered successfully! Please log in.");
        navigate("/login"); 
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };
  

  return (
  <div className="register-container">
    <div className="register-form">
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="input-field"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="input-field"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="input-field"
        />
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Registering..." : "Register"}
        </button>
        <p style={{ textAlign: 'center'}}>OR</p>
        <OAuth/>
      </form>
      <div className="switch-link">
        Already registered? <Link to="/login" className="login-link">Login here</Link>
      </div>
    </div>
  </div>
);

};

export default Register;
