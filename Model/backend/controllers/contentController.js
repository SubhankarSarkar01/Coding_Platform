const pool = require('../config/db');

// GET /api/content/categories
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json({ categories: rows });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// GET /api/content/problems
exports.getProblems = async (req, res) => {
    try {
        const rawCategory = req.params.category || req.query.category;
        const category = rawCategory ? rawCategory.toLowerCase() : null;

        console.log("Category received:", rawCategory, "-> Processed to:", category);

        let query = 'SELECT slug, title, category, difficulty, description FROM questions WHERE is_active = 1';
        const params = [];
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        const [rows] = await pool.query(query, params);
        res.json({ problems: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/content/problems/:slug
exports.getProblemDetail = async (req, res) => {
    try {
        const { slug } = req.params;
        const [rows] = await pool.query('SELECT * FROM questions WHERE slug = ? AND is_active = 1', [slug]);
        if (!rows.length) return res.status(404).json({ message: 'Problem not found' });
        res.json({ problem: rows[0] });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
