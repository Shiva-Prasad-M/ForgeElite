import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css'; 

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success-container">
      <div className="content">
        <h1 className="success-title">🎉 Payment Successful!</h1>
        <p className="success-message">You have successfully enrolled in the course. Welcome aboard!</p>
        <button
          className="back-home-button"
          onClick={() => navigate('/home')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
