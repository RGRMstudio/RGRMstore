import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// Initialize Stripe with your Public Key from Vercel Environment Variables
// It must be named exactly NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in Vercel
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Create a Checkout Session on the server side
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
        throw new Error("Could not retrieve client secret. Check your API keys.");
      }

      // 2. Redirect to Stripe's secure checkout page
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: clientSecret, 
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMessage("There was an error connecting to Stripe. Please check your keys.");
    } finally {
      setLoading(false);
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
          disabled={loading}
          style={{
            backgroundColor: 'black',
            color: 'white',
            padding: '15px 40px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '10px',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? 'PROCESSING...' : 'PURCHASE NOW'}
        </button>

        {errorMessage && (
          <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
