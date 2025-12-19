import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getEarningsOverTime, getRecruitGrowth, getHypeTicker, getFomoAlerts } from '../controllers/analyticsController';

const router = express.Router();

router.get('/earnings', protect, getEarningsOverTime);
router.get('/growth', protect, getRecruitGrowth);

// Public or Protected? Hype Ticker is usually public motivation, but let's keep it protected for now (internal dashboard)
router.get('/hype-ticker', protect, getHypeTicker);
router.get('/alerts', protect, getFomoAlerts);

export default router;
