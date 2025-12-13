// /pages/api/create-printful-order.js

// NOTE: Node-fetch is used here because your environment may not support the global fetch
import fetch from 'node-fetch'; 

const getPrintfulApiKey = () => {
  // We assume one key now for simplicity. Use the environment variable.
  return process.env.PRINTFUL_API_KEY; 
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { orderDetails } = req.body;

    const apiKey = getPrintfulApiKey();
    if (!apiKey) {
        return res.status(500).json({ message: 'Printful API Key is missing.' });
    }

    // Send the order details to the Printful API
    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Basic Auth with the API Key as the password
        'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`,
      },
      body: JSON.stringify({
        status: 'draft', // Always start as draft for safety
        ...orderDetails,
      }),
    });

    const data = await response.json();

    if (response.ok && data.code === 200) {
      return res.status(200).json({ 
          success: true, 
          message: 'Printful order draft created successfully.', 
          printfulOrderId: data.result.id 
      });
    } else {
      console.error('Printful API Error:', data.error);
      return res.status(400).json({ 
          success: false, 
          message: 'Failed to create Printful order draft.', 
          error: data.error 
      });
    }

  } catch (error) {
    console.error('Server error during Printful order creation:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
