import express from 'express';
import { getSystemStats, runCommissionRun, getSystemLogs, getCommissionsHistory } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', protect, admin, getSystemStats);
router.get('/logs', protect, admin, getSystemLogs);
router.get('/commissions', protect, admin, getCommissionsHistory);
router.post('/run-commissions', protect, admin, runCommissionRun);

export default router;