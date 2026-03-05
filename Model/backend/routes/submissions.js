const express = require('express');
const router = express.Router();
const submissions = require('../controllers/submissionsController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, submissions.createSubmission);
router.get('/recent', auth, submissions.getRecentSubmissions);

module.exports = router;
