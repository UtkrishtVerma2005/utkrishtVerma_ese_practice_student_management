const axios = require('axios');
const Student = require('../models/Student');

const handleChat = async (req, res) => {
    const { message } = req.body;
    try {
        // Fetch fresh student data to feed context into the chatbot
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
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Chatbot model runtime error' });
    }
};

module.exports = { handleChat };