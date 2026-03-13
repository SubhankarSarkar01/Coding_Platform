const express = require('express');
const router = express.Router();
const codeExecutionController = require('../controllers/codeExecutionController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Execute code
router.post('/execute', codeExecutionController.executeCode);

// Run test cases
router.post('/test', codeExecutionController.runTests);

// Get supported languages
router.get('/languages', codeExecutionController.getSupportedLanguages);

module.exports = router;
