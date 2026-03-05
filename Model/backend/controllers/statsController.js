const pool = require('../config/db');

// GET /api/stats
exports.getUserStats = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT s.xp, s.problems_solved, s.streak_days, s.country, u.name, u.email ' +
            'FROM user_stats s JOIN users u ON s.user_id = u.id WHERE s.user_id = ?',
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Stats not found' });
        res.json({ stats: rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/stats/weekly
exports.getWeeklyActivity = async (req, res) => {
    try {
        // Mocking weekly activity based on submissions for now
        // Real logic would group by DAY(submitted_at) for the last 7 days
        const [rows] = await pool.query(`
      SELECT DATE(submitted_at) as date, COUNT(*) as count 
      FROM submissions 
      WHERE user_id = ? AND submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(submitted_at)
    `, [req.user.id]);

        res.json({ weekly: rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/stats/categories
exports.getCategoryStats = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT category, COUNT(*) as solved_count 
      FROM submissions 
      WHERE user_id = ? AND status = 'Solved'
      GROUP BY category
    `, [req.user.id]);
        res.json({ categories: rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
