const express = require('express');
const router = express.Router();
const leaderboard = require('../controllers/leaderboardController');

router.get('/', leaderboard.getLeaderboard);

module.exports = router;
