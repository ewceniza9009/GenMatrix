import express from 'express';
import { getTree, getUpline, searchDownline, getMemberDetails, getDownline } from '../controllers/genealogyController';

import { protect } from '../middleware/authMiddleware';
import * as placementController from '../controllers/placementController';

const router = express.Router();

router.get('/tree', protect, getTree);
router.get('/upline', protect, getUpline);
router.get('/downline', protect, getDownline);

// Holding Tank
router.get('/holding-tank', protect, placementController.getHoldingTank);
router.post('/place-member', protect, placementController.placeUserManually);

// Search
// Search
router.get('/search-downline', protect, searchDownline);
router.get('/member/:memberId', protect, getMemberDetails);

export default router;