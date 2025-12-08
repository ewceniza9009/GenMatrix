import express from 'express';
import * as genealogyController from '../controllers/genealogyController';

const router = express.Router();

router.get('/tree', genealogyController.getTree);
router.get('/upline', genealogyController.getUpline);

export default router;