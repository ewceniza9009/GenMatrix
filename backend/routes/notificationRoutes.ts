import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    seedNotifications
} from '../controllers/notificationController';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.post('/seed', protect, seedNotifications);

export default router;
