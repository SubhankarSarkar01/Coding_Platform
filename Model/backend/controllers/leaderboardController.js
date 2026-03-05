const pool = require('../config/db');

// GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { country = 'All' } = req.query;
    let query = 'SELECT u.name, s.xp, s.problems_solved, s.country ' +
      'FROM user_stats s JOIN users u ON s.user_id = u.id';
    const params = [];

    if (country !== 'All') {
      query += ' WHERE s.country = ?';
      params.push(country);
    }

    query += ' ORDER BY s.xp DESC LIMIT 50';

    const [rows] = await pool.query(query, params);
    res.json({ leaderboard: rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
