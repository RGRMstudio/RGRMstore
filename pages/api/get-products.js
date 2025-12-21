// pages/api/get-products.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const response = await axios.get(
      'https://api.printful.com/store/products',
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTFUL_API_KEY_1}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    console.error('Get products error:', err.message);
    return res
      .status(500)
      .json({ error: err.message || 'Error fetching products' });
  }
}
