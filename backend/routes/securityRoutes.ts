import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, admin } from '../middleware/authMiddleware';
import {
    uploadKYC,
    updateKYCStatus,
    getPendingKYC,
    generate2FA,
    verify2FA,
    disable2FA,
    validate2FA
} from '../controllers/securityController';

const router = express.Router();

// Multer Storage Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/kyc';
        // Create dir if not exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user?._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed'));
    }
});

// KYC
router.post('/kyc/upload', protect, upload.single('document'), uploadKYC);
router.put('/kyc/status', protect, admin, updateKYCStatus);
router.get('/kyc/pending', protect, admin, getPendingKYC);

// 2FA
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA); // Enable
router.post('/2fa/disable', protect, disable2FA);
router.post('/2fa/validate', protect, validate2FA);

export default router;
