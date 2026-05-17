const axios = require('axios');
const Student = require('../models/Student');

const handleChat = async (req, res) => {
    const { message } = req.body;
    try {
        // 1. MongoDB Cloud se student data nikalna (agar database query aayi toh use karne ke liye)
        const students = await Student.find({}, 'name rollNumber course grade');
        const contextString = JSON.stringify(students);

        // 🚨 GEMINI KEY HATA DI HAI - Ab sirf absolute OpenRouter key check hogi
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error("OPENROUTER_API_KEY is missing in Render environment variables.");
        }

        // 2. OpenRouter API Call with Universal Llama-3 Free Model
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'meta-llama/llama-3-8b-instruct:free', 
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful and highly intelligent General AI Assistant. You have access to a Student Database context: ${contextString}. 
                        
                        RULES:
                        1. If the user asks about students, grades, or courses, use the database context to answer accurately.
                        2. If the user asks ANY general question (coding, greetings, jokes, general knowledge), act as a general-purpose bot and answer beautifully using your intelligence.
                        3. Keep responses direct, short, and friendly.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            }
        );

        // 3. Response extract karke frontend ko bhejna
        if (response.data && response.data.choices && response.data.choices[0].message) {
            const replyText = response.data.choices[0].message.content;
            return res.json({ reply: replyText });
        } else {
            throw new Error("Invalid response envelope from OpenRouter.");
        }

    } catch (error) {
        console.error("DEBUG - OpenRouter General Bot Failure:", error.response?.data || error.message);
        
        // Safe backup text agar rate limit hit ho jaye
        return res.json({ 
            reply: `[OpenRouter General Bot]: Hey! Connection is taking a bit longer, but I'm fully active. What's on your mind?`
        });
    }
};

module.exports = { handleChat };