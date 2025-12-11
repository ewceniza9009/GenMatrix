import express from 'express';
import { getMyWallet, requestWithdrawal, getPendingWithdrawals, processWithdrawal } from '../controllers/walletController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getMyWallet);
router.post('/withdraw', protect, requestWithdrawal);

// Admin Routes
router.get('/admin/withdrawals', protect, admin, getPendingWithdrawals);
router.post('/admin/process-withdrawal', protect, admin, processWithdrawal);

export default router;