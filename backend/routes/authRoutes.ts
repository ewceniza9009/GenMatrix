import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

// Register Route
router.post('/register', authController.register);

// Login Route
router.post('/login', authController.login);

export default router;