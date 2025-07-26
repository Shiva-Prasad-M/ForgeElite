import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe('pk_test_51RKCnXRZScONxzFm2Wu8RCGRpQg2E5Dx4KMb4EbBO1iFJ726OisKeLVkigQdlBarpd7aeActQxm3G0olgpCjo2UY007UN8Q2g6'); // Public key

const PaymentPage = ({ selectedCourse }) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>Complete Your Payment</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm selectedCourse={selectedCourse} />
      </Elements>
    </div>
  );
};

export default PaymentPage;
