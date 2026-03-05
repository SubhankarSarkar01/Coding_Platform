const express = require('express');
const router = express.Router();
const stats = require('../controllers/statsController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, stats.getUserStats);
router.get('/weekly', auth, stats.getWeeklyActivity);
router.get('/categories', auth, stats.getCategoryStats);

module.exports = router;
