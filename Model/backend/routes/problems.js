const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/list', problemController.getAllProblems);
router.get('/:slug', problemController.getProblem);

// Protected routes (require authentication)
router.post('/upload', authMiddleware, problemController.uploadProblem);
router.post('/run', authMiddleware, problemController.runTests);
router.post('/submit', authMiddleware, problemController.submitCode);
router.get('/:problemId/submissions', authMiddleware, problemController.getSubmissions);

module.exports = router;
