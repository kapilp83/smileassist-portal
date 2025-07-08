// Vercel Serverless Function to send WhatsApp messages.
// This file goes in the /api directory.

import axios from 'axios';

// This handler function will be executed by Vercel when a request comes to /api/send-whatsapp
export default async function handler(request, response) {
    console.log("API endpoint /api/send-whatsapp was hit."); // <-- New Log

    // Only allow POST requests
    if (request.method !== 'POST') {
        response.setHeader('Allow', ['POST']);
        return response.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const { message } = request.body;
    console.log("Received message:", message); // <-- New Log

    if (!message) {
        return response.status(400).json({ success: false, error: 'Message content is required.' });
    }

    // Load credentials securely from Vercel's Environment Variables
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, RECIPIENT_PHONE_NUMBER } = process.env;
    
    // --- VITAL DEBUGGING STEP ---
    // Log the environment variables to check if they are loaded correctly
    console.log("Recipient Phone Number:", RECIPIENT_PHONE_NUMBER ? 'Loaded' : 'MISSING!');
    console.log("WhatsApp Phone Number ID:", WHATSAPP_PHONE_NUMBER_ID ? 'Loaded' : 'MISSING!');
    console.log("WhatsApp Access Token:", WHATSAPP_ACCESS_TOKEN ? 'Loaded' : 'MISSING!');
    
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !RECIPIENT_PHONE_NUMBER) {
        console.error("Server Configuration Error: Missing one or more required environment variables.");
        return response.status(500).json({ success: false, error: 'Server configuration error.' });
    }

    const apiUrl = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        to: RECIPIENT_PHONE_NUMBER,
        type: 'text',
        text: {
            preview_url: false,
            body: message
        }
    };

    const headers = {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        console.log("Attempting to send API request to WhatsApp..."); // <-- New Log
        await axios.post(apiUrl, payload, { headers });
        console.log("WhatsApp request successful."); // <-- New Log
        response.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        // Log the detailed error from WhatsApp's API
        console.error('Error sending WhatsApp message:', error.response ? error.response.data.error.message : error.message);
        response.status(500).json({ success: false, error: 'Failed to send message.' });
    }
}
