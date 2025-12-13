// This file runs on the Vercel server, not the user's browser, keeping the keys safe.
const axios = require('axios'); // A library to easily make HTTP requests

// 1. Get the securely stored API keys from Vercel's environment variables
const API_KEY_1 = process.env.PRINTFUL_API_KEY_1;
const API_KEY_2 = process.env.PRINTFUL_API_KEY_2;

// The base URL for the Printful API
const API_BASE_URL = 'https://api.printful.com/v1/store/products';

// Function to fetch products from a single Printful store
async function fetchProducts(apiKey) {
    if (!apiKey) return []; // Safety check

    try {
        const response = await axios.get(API_BASE_URL, {
            headers: {
                // Use the Bearer format for authorization
                'Authorization': `Bearer ${apiKey}` 
            }
        });
        
        // The API returns a list of 'sync_products'
        return response.data.result.map(product => ({
            id: product.id,
            name: product.name,
            // You will need to dig into the variants array to get pricing and image info
            price: product.variants[0] ? product.variants[0].retail_price : 'N/A',
            image_url: product.thumbnail_url 
            // We can add more details like variants later!
        }));

    } catch (error) {
        console.error('Error fetching Printful products:', error.message);
        return [];
    }
}

// The main handler function for the Vercel Serverless Function
module.exports = async (req, res) => {
    // 2. Fetch products from both stores concurrently
    const [productsFromStore1, productsFromStore2] = await Promise.all([
        fetchProducts(API_KEY_1),
        fetchProducts(API_KEY_2)
    ]);

    // 3. Combine the results into one list
    const allProducts = [...productsFromStore1, ...productsFromStore2];

    // 4. Send the combined product list back to the browser
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send({ success: true, products: allProducts });
};
