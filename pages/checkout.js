// /pages/checkout.js

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

// 1. Load Stripe using the PUBLIC key from Vercel
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);


// --- The Payment Form Component ---
const CheckoutForm = ({ orderTotalInCents }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
        // A. Call your server-side API to create the PaymentIntent
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: orderTotalInCents, 
                order_id: 'RGRM-TEST-123', 
            }),
        });

        const data = await response.json();
        const clientSecret = data.clientSecret;

        if (!clientSecret) {
            setErrorMessage(data.message || 'Failed to initiate payment.');
            setIsLoading(false);
            return;
        }

        // B. Confirm the payment with Stripe
        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            // Where to redirect the customer after a successful payment
            return_url: `${window.location.origin}/order-success`, 
          },
        });

        if (error) {
          setErrorMessage(error.message);
        }
    } catch (error) {
        setErrorMessage('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  const displayTotal = (orderTotalInCents / 100).toFixed(2);

  return (
    <form onSubmit={handleSubmit} style={{maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px'}}>
      <h2>Order Total: ${displayTotal}</h2>

      {/* Stripe payment widget */}
      <PaymentElement />

      <button disabled={isLoading || !stripe || !elements} className="pay-button" style={{
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: isLoading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
      }}>
        {isLoading ? 'Processing...' : `Pay Now`}
      </button>

      {/* Display error messages */}
      {errorMessage && <div style={{color: 'red', marginTop: '10px'}}>{errorMessage}</div>}
    </form>
  );
};


// --- The Main Page Wrapper ---
export default function CheckoutPage() {
    // !!! IMPORTANT: REPLACE this with the REAL calculated cart total in CENTS
    const orderTotalInCents = 4599; // Example: $45.99 

    const options = {
        mode: 'payment',
        amount: orderTotalInCents,
        currency: 'usd',
    };

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        return <div>Error: Stripe Publishable Key is missing. Check Vercel Environment Variables.</div>
    }

    return (
        <div style={{textAlign: 'center', paddingTop: '50px'}}>
            <h1>RaGuiRoMo Checkout</h1>

            {/* Stripe Elements Provider */}
            <Elements stripe={stripePromise} options={options}>
                <CheckoutForm orderTotalInCents={orderTotalInCents} />
            </Elements>
        </div>
    );
}
