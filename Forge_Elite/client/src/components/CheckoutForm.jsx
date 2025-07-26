import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './CheckoutForm.css';

const CheckoutForm = ({ selectedCourse }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [cardName, setCardName] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // 1. Create Payment Intent (only send amount in cents)
      const response = await fetch('http://localhost:8000/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedCourse.price * 100, // USD to cents
        }),
      });

      const data = await response.json();
      const clientSecret = data.clientSecret;

      if (!clientSecret) {
        setError('Failed to create payment intent.');
        return;
      }

      // 2. Get card details
      const cardElement = elements.getElement(CardElement);

      // 3. Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardName,
            email,
            address: {
              country: country.toUpperCase(),
              postal_code: zipCode,
            },
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        navigate('/payment-success', { state: { courseId: selectedCourse.id } });
      }else{
        navigate("/payment-failure")
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="checkout-form-container">
      <h2>Payment Information</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cardName">Name on Card</label>
          <input
            type="text"
            id="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Card Information</label>
          <CardElement className="card-element" />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., IN (for India)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="zipCode">Zip Code</label>
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={!stripe} className="submit-button">
          Submit Payment
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;
