import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
    createTicket,
    getMyTickets,
    getAllTickets,
    replyTicket,
    updateTicketStatus
} from '../controllers/supportController';

const router = express.Router();

// Public (Authenticated)
router.route('/')
    .post(protect, createTicket)
    .get(protect, getMyTickets);

router.route('/:ticketId/reply')
    .post(protect, replyTicket);

// Admin
router.route('/all')
    .get(protect, admin, getAllTickets);

router.route('/:ticketId/status')
    .put(protect, admin, updateTicketStatus);

export default router;
