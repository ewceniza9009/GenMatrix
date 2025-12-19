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

export default router;