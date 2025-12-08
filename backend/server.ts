// ---- File: backend/server.ts ----

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import Routes
import authRoutes from './routes/authRoutes';
import genealogyRoutes from './routes/genealogyRoutes';
import adminRoutes from './routes/adminRoutes';
import walletRoutes from './routes/walletRoutes';

// Import Seeder
import { seedDatabase } from './services/seederService';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection & Seed Trigger
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    // --- AUTOMATED SEED TRIGGER ---
    await seedDatabase(); 
    // ------------------------------
    
    // Start Server only after DB is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Base Route
app.get('/', (req, res) => {
  res.send('MLM Backend API Running (TS)');
});

// --- MOUNT ROUTES ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/network', genealogyRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/wallet', walletRoutes);