// pages/checkout.js
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePurchase() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok || !data.sessionId) {
        throw new Error(
          data.error || 'There was an error connecting to Stripe.'
        );
      }

      const stripe = await stripePromise;

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(
        err.message ||
          'There was an error connecting to Stripe. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1>RAGUIROMO STORE</h1>
      <p>Bauhaus-Inspired Minimalist Collection</p>

      <section
        style={{
          border: '1px solid black',
          maxWidth: '400px',
          margin: '2rem auto',
          padding: '2rem',
        }}
      >
        <h2>Premium Art Print</h2>
        <p>$25.00 USD</p>

        <button
          onClick={handlePurchase}
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            background: 'black',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Processing…' : 'PURCHASE NOW'}
        </button>

        {error && (
          <p style={{ color: 'red', marginTop: '1rem' }}>
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
