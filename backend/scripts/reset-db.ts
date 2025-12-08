import mongoose from 'mongoose';
import User from '../models/User';
import Commission from '../models/Commission';
import Wallet from '../models/Wallet';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const resetDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    await User.deleteMany({});
    await Commission.deleteMany({});
    await Wallet.deleteMany({});
    
    console.log('Database Cleaned');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetDb();
