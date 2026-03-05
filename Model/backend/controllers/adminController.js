const pool = require('../config/db');

// ──────────────────── DASHBOARD STATS ────────────────────
exports.getStats = async (req, res) => {
    try {
        const [[userCount]] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [[problemCount]] = await pool.query('SELECT COUNT(*) as count FROM questions');
        const [[categoryCount]] = await pool.query('SELECT COUNT(*) as count FROM categories');
        const [[submissionCount]] = await pool.query('SELECT COUNT(*) as count FROM submissions');
        res.json({
            users: userCount.count,
            problems: problemCount.count,
            categories: categoryCount.count,
            submissions: submissionCount.count,
        });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

// ──────────────────── CATEGORIES ────────────────────
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json({ categories: rows });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.createCategory = async (req, res) => {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'name and slug are required' });
    try {
        await pool.query('INSERT INTO categories (name, slug, description) VALUES (?,?,?)', [name, slug, description || '']);
        res.status(201).json({ message: 'Category created' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Category already exists' });
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    try {
        await pool.query('UPDATE categories SET name=?, slug=?, description=? WHERE id=?', [name, slug, description, id]);
        res.json({ message: 'Category updated' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM categories WHERE id=?', [id]);
        res.json({ message: 'Category deleted' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ──────────────────── PROBLEMS ────────────────────
exports.getProblems = async (req, res) => {
    try {
        const { category } = req.query;
        console.log("Admin getProblems category:", category);
        let query = 'SELECT p.*, u.name as author FROM questions p LEFT JOIN users u ON p.created_by = u.id';
        const params = [];
        if (category) {
            query += ' WHERE p.category = ?';
            params.push(category);
        }
        query += ' ORDER BY p.created_at DESC';
        const [rows] = await pool.query(query, params);
        res.json({ problems: rows });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getProblem = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Problem not found' });
        res.json({ problem: rows[0] });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.createProblem = async (req, res) => {
    const { slug, title, category_slug, difficulty, description, constraints_text, steps_text, starter_code, solution_code, youtube_link } = req.body;
    const category = category_slug; // alias
    const constraints = constraints_text;
    const algorithm_steps = steps_text;

    if (!slug || !title || !category) return res.status(400).json({ message: 'slug, title, and category are required' });
    try {
        await pool.query(
            'INSERT INTO questions (slug, title, category, difficulty, description, constraints, algorithm_steps, starter_code, solution_code, youtube_link, input_json, frames_json, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [slug, title, category, difficulty || 'Medium', description || '', constraints || '', algorithm_steps || '', starter_code || '', solution_code || '', youtube_link || '', req.body.input_json || null, req.body.frames_json || null, req.user.id]
        );
        res.status(201).json({ message: 'Problem created successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Problem with this slug already exists' });
        console.error(err); res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProblem = async (req, res) => {
    const { id } = req.params;
    const { slug, title, category_slug, difficulty, description, constraints_text, steps_text, starter_code, solution_code, youtube_link, is_active } = req.body;
    const category = category_slug;
    const constraints = constraints_text;
    const algorithm_steps = steps_text;
    try {
        await pool.query(
            'UPDATE questions SET slug=?, title=?, category=?, difficulty=?, description=?, constraints=?, algorithm_steps=?, starter_code=?, solution_code=?, youtube_link=?, input_json=?, frames_json=?, is_active=? WHERE id=?',
            [slug, title, category, difficulty, description, constraints, algorithm_steps, starter_code, solution_code, youtube_link, req.body.input_json, req.body.frames_json, is_active ?? 1, id]
        );
        res.json({ message: 'Problem updated successfully' });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.deleteProblem = async (req, res) => {
    try {
        await pool.query('DELETE FROM questions WHERE id=?', [req.params.id]);
        res.json({ message: 'Problem deleted' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ──────────────────── USERS ────────────────────
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.is_admin, u.created_at,
        COALESCE(s.xp,0) as xp, COALESCE(s.problems_solved,0) as problems_solved
      FROM users u LEFT JOIN user_stats s ON s.user_id = u.id
      ORDER BY u.created_at DESC
    `);
        res.json({ users: rows });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.toggleAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE users SET is_admin = NOT is_admin WHERE id=?', [id]);
        res.json({ message: 'Admin status toggled' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    if (Number(id) === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    try {
        await pool.query('DELETE FROM users WHERE id=?', [id]);
        res.json({ message: 'User deleted' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
