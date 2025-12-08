import mongoose from 'mongoose';
import Package from '../models/Package';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const seedPackages = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    await Package.deleteMany({}); // Clear to be safe
    
    await new Package({
        name: 'Starter',
        price: 100,
        pv: 100,
        description: 'Basic entry package',
        bonuses: [
            { type: 'Direct', value: 10 },
            { type: 'Level1', value: 5 },
            { type: 'Level2', value: 2 }
        ]
    }).save();
    
    console.log('Created Starter Package (100 PV)');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPackages();
