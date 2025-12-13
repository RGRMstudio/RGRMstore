// This file runs securely on the Vercel server.
// We must install the stripe library via package.json next.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// You will need to securely look up product details (name, price) here 
// based on the product ID received from the frontend. 
// For simplicity now, we will use mock data. 
// LATER: You would re-use your Printful API logic to get the real details.

// Mock product data for demonstration purposes
const mockProducts = {
    'product_id_1': { name: 'Primary Geometric Tee', unit_amount: 3500, currency: 'usd' }, // $35.00 (Stripe uses cents)
    'product_id_2': { name: 'Line Art Hoodie', unit_amount: 6500, currency: 'usd' }, // $65.00
    // ... add more products here
};


// The main handler for the Stripe Checkout function
module.exports = async (req, res) => {
    // Vercel functions make data available on the request body
    const { productId } = req.body; 

    // 1. Validate the incoming product ID
    const productInfo = mockProducts[productId];

    if (!productInfo) {
        res.status(404).send({ error: 'Product not found.' });
        return;
    }

    try {
        // 2. Create the Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: productInfo.currency,
                        product_data: {
                            name: productInfo.name,
                            // Ideally, you would link to a real product image URL here
                            // images: ['https://yourstore.com/images/product_id_1.jpg'], 
                        },
                        unit_amount: productInfo.unit_amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // Replace with your actual domain later! 
            // Vercel provides a deployment URL for testing: 
            success_url: `${req.headers.origin}/products.html?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/products.html?status=cancelled`,
        });

        // 3. Send the ID back to the frontend to redirect the user
        res.status(200).json({ id: session.id });

    } catch (error) {
        console.error('Stripe API Error:', error);
        res.status(500).send({ error: error.message });
    }
};
