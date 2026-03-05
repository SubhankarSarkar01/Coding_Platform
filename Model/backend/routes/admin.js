const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin guard middleware
const adminGuard = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Dashboard stats
router.get('/stats', authMiddleware, adminGuard, admin.getStats);

// Categories
router.get('/categories', authMiddleware, admin.getCategories);
router.post('/categories', authMiddleware, adminGuard, admin.createCategory);
router.put('/categories/:id', authMiddleware, adminGuard, admin.updateCategory);
router.delete('/categories/:id', authMiddleware, adminGuard, admin.deleteCategory);

// Problems
router.get('/problems', authMiddleware, admin.getProblems);
router.get('/problems/:id', authMiddleware, admin.getProblem);
router.post('/add-question', authMiddleware, adminGuard, admin.createProblem);
router.post('/problems', authMiddleware, adminGuard, admin.createProblem);
router.put('/problems/:id', authMiddleware, adminGuard, admin.updateProblem);
router.delete('/problems/:id', authMiddleware, adminGuard, admin.deleteProblem);

// Users
router.get('/users', authMiddleware, adminGuard, admin.getUsers);
router.put('/users/:id/toggle-admin', authMiddleware, adminGuard, admin.toggleAdmin);
router.delete('/users/:id', authMiddleware, adminGuard, admin.deleteUser);

module.exports = router;
