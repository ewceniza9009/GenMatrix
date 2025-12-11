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
        // Use absolute path relative to this file (in routes/)
        const uploadPath = path.join(__dirname, '../uploads/kyc');

        // Create dir if not exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${(req as any).user?._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
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

// Wrapper to handle Multer errors
const uploadMiddleware = (req: any, res: any, next: any) => {
    upload.single('document')(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ message: `Upload Error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ message: err.message });
        }
        // Everything went fine.
        next();
    });
};

// KYC
router.post('/kyc/upload', protect, uploadMiddleware, uploadKYC);
router.put('/kyc/status', protect, admin, updateKYCStatus);
router.get('/kyc/pending', protect, admin, getPendingKYC);

// 2FA
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA); // Enable
router.post('/2fa/disable', protect, disable2FA);
router.post('/2fa/validate', protect, validate2FA);

export default router;
