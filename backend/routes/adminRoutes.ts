import express from 'express';
import { getSystemStats, runCommissionRun } from '../controllers/adminController';

const router = express.Router();

// protect these in real app with admin middleware
router.get('/stats', getSystemStats);
router.post('/run-commissions', runCommissionRun);

export default router;
