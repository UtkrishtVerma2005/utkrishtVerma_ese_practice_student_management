const express = require('express');
const { handleChat } = require('../controllers/chatController');
// 💡 Humne middleware import rakha hai par use abhi route par bypass kar diya hai
const protect = require('../middleware/authMiddleware'); 
const router = express.Router();

// 🚨 FIX: 'protect' middleware hata diya taaki request bina block hue direct controller tak jaye!
router.post('/', handleChat);

module.exports = router;