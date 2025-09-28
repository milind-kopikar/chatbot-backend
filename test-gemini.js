const axios = require('axios');
require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = 'gemini-2.5-flash'; // Use the newer 2.5 Flash model
    const baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    
    console.log('Testing Gemini API...');
    console.log('Model:', model);
    console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET');
    console.log('Full URL:', `${baseURL}/models/${model}:generateContent`);
    
    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: "Hello, what model are you?" }]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
        }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await axios.post(
            `${baseURL}/models/${model}:generateContent?key=${apiKey}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('ERROR!');
        console.log('Status:', error.response?.status);
        console.log('Error:', JSON.stringify(error.response?.data, null, 2));
        console.log('Full error:', error.message);
    }
}

testGemini();