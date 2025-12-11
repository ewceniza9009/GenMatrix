import { Request, Response } from 'express';
import CMSNotification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper to create notification internally
export const createNotification = async (
    userId: string,
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string
) => {
    try {
        await CMSNotification.create({ userId, type, title, message });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Get user notifications
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await CMSNotification.find({ userId: req.user?._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// Mark as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await CMSNotification.findOneAndUpdate(
            { _id: id, userId: req.user?._id },
            { isRead: true }
        );
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};

// Mark all as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        await CMSNotification.updateMany(
            { userId: req.user?._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
};

// SEED (Test Data)
export const seedNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        await CMSNotification.create([
            {
                userId,
                type: 'success',
                title: 'Commission Received',
                message: 'You initiated a seed test and received a $50.00 mock commission.',
                createdAt: new Date()
            },
            {
                userId,
                type: 'warning',
                title: 'Security Alert',
                message: 'New login detected from Mock Device.',
                createdAt: new Date(Date.now() - 3600000)
            },
            {
                userId,
                type: 'info',
                title: 'System Update',
                message: 'The platform has been updated with live notifications.',
                createdAt: new Date(Date.now() - 7200000)
            }
        ]);
        res.json({ message: 'Seeded test notifications' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding notifications' });
    }
};
