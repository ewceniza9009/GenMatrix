import mongoose from 'mongoose';
import User from '../models/User';
import Package from '../models/Package';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const forceUpdate = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // 1. Force Root PV
    const res = await User.updateOne(
        { username: 'root' }, 
        { $set: { currentLeftPV: 500, currentRightPV: 300 } }
    );
    console.log('Forced Root PV to 500/300:', res);

    // 2. Try to fix Package (Simplified)
    await Package.deleteMany({});
    try {
        await new Package({
            name: 'Starter',
            price: 100,
            pv: 100,
            description: 'Basic entry package',
            bonuses: [] // Skip bonuses for now if they are causing issues
        }).save();
        console.log('Created Starter Package (Simplified)');
    } catch (e) {
        console.error('Package creation failed again:', e);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

forceUpdate();
