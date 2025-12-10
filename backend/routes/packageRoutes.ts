import express from 'express';
import { getAllPackages, createPackage, updatePackage, deletePackage } from '../controllers/packageController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public / Authenticated read
router.get('/', getAllPackages);

// Admin Management
router.post('/', protect, admin, createPackage);
router.put('/:id', protect, admin, updatePackage);
router.delete('/:id', protect, admin, deletePackage);

export default router;
