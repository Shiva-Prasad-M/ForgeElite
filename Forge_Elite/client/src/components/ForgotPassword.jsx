// ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/auth/send-reset-otp', { email });
      if (res.data.success) {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Forgot Password</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            placeholder="Enter your email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="submit-btn">Send OTP</button>
        </form>
        <div className="back-to-login">
          <span onClick={() => navigate("/login")}>Back to Login</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
