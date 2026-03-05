const pool = require('../config/db');

// GET /api/profile
exports.getProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const [userRows] = await pool.query(
            'SELECT id, name, email, is_admin, created_at FROM users WHERE id = ?', [userId]
        );
        if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });

        // Ensure stats row exists
        await pool.query(
            'INSERT IGNORE INTO user_stats (user_id) VALUES (?)', [userId]
        );

        const [statsRows] = await pool.query(
            'SELECT xp, problems_solved, streak_days, country FROM user_stats WHERE user_id = ?', [userId]
        );

        const [rankRow] = await pool.query(
            'SELECT COUNT(*) as rank_num FROM user_stats WHERE xp > (SELECT COALESCE(xp,0) FROM user_stats WHERE user_id = ?)',
            [userId]
        );

        const [recentRows] = await pool.query(
            `SELECT problem_title, category, status, submitted_at 
       FROM submissions WHERE user_id = ? 
       ORDER BY submitted_at DESC LIMIT 5`,
            [userId]
        );

        if (userRows[0]) console.log(`[Profile] User ${userRows[0].email} is_admin: ${userRows[0].is_admin}`);
        res.json({
            user: userRows[0],
            stats: statsRows[0] || { xp: 0, problems_solved: 0, streak_days: 0, country: 'Unknown' },
            global_rank: (rankRow[0].rank_num || 0) + 1,
            recent_submissions: recentRows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/profile
exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, country } = req.body;

    try {
        if (name) {
            await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
        }
        if (country) {
            await pool.query(
                'INSERT INTO user_stats (user_id, country) VALUES (?, ?) ON DUPLICATE KEY UPDATE country = ?',
                [userId, country, country]
            );
        }
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
