import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { getSettings, updateSetting } from '../controllers/settingsController';

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, admin, updateSetting);

export default router;
