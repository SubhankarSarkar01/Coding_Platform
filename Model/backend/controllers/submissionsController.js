const pool = require('../config/db');

// POST /api/submissions
exports.createSubmission = async (req, res) => {
    const { problem_slug, problem_title, category_slug, category, status, code, language } = req.body;
    const userId = req.user.id;
    const cat = category || category_slug;

    if (!problem_slug || !status) return res.status(400).json({ message: 'Missing required fields' });

    try {
        // Record submission with code and language
        await pool.query(
            'INSERT INTO submissions (user_id, problem_slug, problem_title, category, status, code, language) VALUES (?,?,?,?,?,?,?)',
            [userId, problem_slug, problem_title, cat, status, code || null, language || 'javascript']
        );

        // If solved, update user stats
        if (status === 'Solved') {
            // Check if already solved before
            const [existing] = await pool.query(
                'SELECT id FROM submissions WHERE user_id = ? AND problem_slug = ? AND status = "Solved"',
                [userId, problem_slug]
            );

            // If this is the first time solving it (record already inserted above, so check if count > 1)
            if (existing.length <= 1) {
                await pool.query(
                    'UPDATE user_stats SET problems_solved = problems_solved + 1, xp = xp + 50 WHERE user_id = ?',
                    [userId]
                );
            } else {
                // Just add a bit of XP for re-solving? Or nothing.
                await pool.query('UPDATE user_stats SET xp = xp + 10 WHERE user_id = ?', [userId]);
            }
        } else {
            // Just attempted
            await pool.query('UPDATE user_stats SET xp = xp + 5 WHERE user_id = ?', [userId]);
        }

        res.status(201).json({ message: 'Submission recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/submissions/recent
exports.getRecentSubmissions = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 5',
            [req.user.id]
        );
        res.json({ submissions: rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
