const axios = require('axios');
const Student = require('../models/Student');

const handleChat = async (req, res) => {
    const { message } = req.body;
    try {
        // MongoDB Cloud se fresh data lekar context banana
        const students = await Student.find({}, 'name rollNumber course grade');
        const contextString = JSON.stringify(students);

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'meta-llama/llama-3-8b-instruct:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI Assistant for a Student Management System. Here is the active database records context: ${contextString}. Use this data to precisely answer user metrics/questions.`
                    },
                    { role: 'user', content: message }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    // 🚨 OPENROUTER FREE MODELS KE LIYE YEH DONO HEADERS MANDATORY HAIN:
                    'HTTP-Referer': 'http://localhost:5173', 
                    'X-Title': 'Student Management System'
                }
            }
        );

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        // Agar dubara error aaye, toh server console/logs me detail print hogi
        console.error("OpenRouter Error Details:", error.response?.data || error.message);
        res.status(500).json({ error: 'Chatbot model runtime error' });
    }
};

module.exports = { handleChat };