const express = require('express');
const router = express.Router();
const content = require('../controllers/contentController');

router.get('/categories', content.getCategories);
router.get('/questions', content.getProblems);
router.get('/questions/:category', content.getProblems); // Use query logic internally
router.get('/question/:slug', content.getProblemDetail);
router.get('/problems', content.getProblems);
router.get('/problems/:slug', content.getProblemDetail);

module.exports = router;
