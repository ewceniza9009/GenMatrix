import express from 'express';
import * as genealogyController from '../controllers/genealogyController';

import { protect } from '../middleware/authMiddleware';
import * as placementController from '../controllers/placementController';

const router = express.Router();

router.get('/tree', genealogyController.getTree);
router.get('/upline', genealogyController.getUpline);

// Holding Tank
router.get('/holding-tank', protect, placementController.getHoldingTank);
router.post('/place-member', protect, placementController.placeUserManually);

// Search
// Search
router.get('/search-downline', protect, genealogyController.searchDownline);
router.get('/member/:memberId', protect, genealogyController.getMemberDetails);

export default router;