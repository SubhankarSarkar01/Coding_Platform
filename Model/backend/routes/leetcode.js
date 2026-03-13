const express = require('express');
const router = express.Router();
const leetcodeController = require('../controllers/leetcodeController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/problems', leetcodeController.getAllProblems);
router.get('/problems/:slug', leetcodeController.getProblem);

// Protected routes (require authentication)
router.use(authMiddleware);

router.post('/problems/upload', leetcodeController.uploadProblem);
router.post('/run', leetcodeController.runCode);
router.post('/submit', leetcodeController.submitCode);
router.get('/submissions/:problemId', leetcodeController.getSubmissions);

module.exports = router;
