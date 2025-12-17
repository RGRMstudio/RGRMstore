import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// Initialize Stripe with your Public Key from Vercel Environment Variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const [status, setStatus] = useState('idle');

  const handleCheckout = async () => {
    setStatus('loading');

    try {
      // 1. Create the Payment Intent on your server
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 2500, // Amount in cents ($25.00)
          order_id: 'RGRM-' + Date.now(),
        }),
      });

      const { clientSecret } = await res.json();

      if (!clientSecret) {
        throw new Error("Failed to retrieve client secret from Stripe.");
      }

      // 2. Redirect to Stripe's secure checkout page
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: clientSecret, 
      });

      if (error) {
        console.error("Stripe Error:", error);
        setStatus('error');
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>RaGuiRoMo Store</h1>
      <p>Bauhaus-Inspired Minimalist Collection</p>
      
      <div style={{ 
        border: '2px solid black', 
        padding: '30px', 
        display: 'inline-block', 
        marginTop: '20px' 
      }}>
        <h2>Premium Art Print</h2>
        <p style={{ fontSize: '24px' }}>$25.00 USD</p>
        
        <button
          onClick={handleCheckout}
          disabled={status === 'loading'}
          style={{
            backgroundColor: 'black',
            color: 'white',
            padding: '15px 40px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {status === 'loading' ? 'PROCESSING...' : 'PURCHASE NOW'}
        </button>

        {status === 'error' && (
          <p style={{ color: 'red', marginTop: '10px' }}>
            There was an error connecting to Stripe. Please check your keys.
          </p>
        )}
      </div>
    </div>
  );
}

