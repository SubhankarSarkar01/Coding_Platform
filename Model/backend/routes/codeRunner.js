const express = require('express');
const router = express.Router();
const codeRunnerController = require('../controllers/codeRunnerController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route - requires authentication
router.post('/run', authMiddleware, codeRunnerController.runCode);

module.exports = router;
