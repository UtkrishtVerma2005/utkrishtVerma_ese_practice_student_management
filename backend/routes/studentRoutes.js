const express = require('express');
const { addStudent, getStudents, updateStudent, deleteStudent } = require('../controllers/studentController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

// Route for '/' (e.g., /api/students)
router.route('/')
    .get(protect, getStudents)
    .post(protect, addStudent);

// Route for '/:id' (e.g., /api/students/6a093aee...)
router.route('/:id')
    .put(protect, updateStudent)
    .delete(protect, deleteStudent);

module.exports = router;