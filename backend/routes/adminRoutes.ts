import express from 'express';
import { getSystemStats, runCommissionRun, getSystemLogs, getCommissionsHistory, getAllUsers, updateUserRole, toggleUserStatus, getSystemAnalytics } from '../controllers/adminController';
import { getConfig, updateConfig } from '../controllers/systemController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', protect, admin, getSystemStats);
router.get('/analytics/system', protect, admin, getSystemAnalytics);
router.get('/logs', protect, admin, getSystemLogs);
router.get('/commissions', protect, admin, getCommissionsHistory);
router.post('/run-commissions', protect, admin, runCommissionRun);

router.get('/config', protect, admin, getConfig);
router.put('/config', protect, admin, updateConfig);

// User Management
router.get('/users', protect, admin, getAllUsers);
router.put('/users/role', protect, admin, updateUserRole);
router.patch('/users/status', protect, admin, toggleUserStatus);

import { getAllIdeas, createIdea, updateIdea, deleteIdea, promoteIdea } from '../controllers/productIdeaController';

// Product Lab (Ideas)
router.get('/product-ideas', protect, admin, getAllIdeas);
router.post('/product-ideas', protect, admin, createIdea);
router.put('/product-ideas/:id', protect, admin, updateIdea);
router.delete('/product-ideas/:id', protect, admin, deleteIdea);
router.post('/product-ideas/:id/promote', protect, admin, promoteIdea);

export default router;