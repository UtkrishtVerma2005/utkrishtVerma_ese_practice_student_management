const express = require('express');
const { addStudent, getStudents } = require('../controllers/studentController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, addStudent).get(protect, getStudents);

module.exports = router;