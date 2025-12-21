// pages/api/create-printful-order.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { items, recipient } = req.body; // adjust to your frontend payload

    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY_1}`,
      },
      body: JSON.stringify({
        recipient,
        items,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Printful error:', data);
      return res.status(response.status).json({
        error: data.error || 'Error creating Printful order',
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Printful error:', err.message);
    return res
      .status(500)
      .json({ error: err.message || 'Error creating Printful order' });
  }
}
