import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentFailure.css';  // You can add custom CSS for this component

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-failure-container">
      <div className="content">
        <h1 className="failure-title">❌ Payment Failed</h1>
        <p className="failure-message">Something went wrong. Please try again.</p>
        <button
          className="back-home-button"
          onClick={() => navigate('/courses')}
        >
          Back to Course Page
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;
