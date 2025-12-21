// /pages/api/stripe-webhook.js

import Stripe from 'stripe';
import { buffer } from 'micro';
import fetch from 'node-fetch'; 

// This uses the Webhook Secret key you added in Vercel: STRIPE_WEBHOOK_SECRET
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; 

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Next.js setting to handle the raw request body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // 1. Verify the message is truly from Stripe using the secret
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle the successful payment event
  if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log(`✅ PaymentIntent successful: ${paymentIntent.id}`);

      // === TRIGGER PRINTFUL FULFILLMENT ===

      const dummyOrderDetails = {
          recipient: {
              name: "RaGuiRoMo Customer",
              address1: "123 Test Street",
              city: "New York",
              state_code: "NY",
              country_code: "US",
              zip: "10001",
              email: "test@raguiromo.store"
          },
          items: [
              {
                  variant_id: 1234, 
                  quantity: 1,
                  retail_price: "25.00" 
              }
          ]
      };

      // Call your local API route to submit the order to Printful
      const printfulResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/create-printful-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              orderDetails: dummyOrderDetails,
          }),
      });

      const printfulData = await printfulResponse.json();

      if (printfulData.success) {
          console.log('🎉 Printful order successfully submitted as DRAFT:', printfulData.printfulOrderId);
      } else {
          console.error('❌ FULFILLMENT ERROR:', printfulData.message);
      }

  } else if (event.type === 'payment_intent.payment_failed') {
      console.log(`❌ PaymentIntent failed: ${event.data.object.id}`);
  }

  // 3. Always send a 200 response to Stripe to acknowledge receipt of the event
  res.json({ received: true });
}
