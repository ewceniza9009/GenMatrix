
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Package from './models/Package';

dotenv.config();

const fixPackages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mlm');
        console.log('Connected to MongoDB');

        const result = await Package.updateMany(
            {},
            { $set: { isActive: true, features: ['Automated Placement', 'Basic Support', 'Standard Commission'], badge: 'Best Value' } }
        );

        console.log(`Updated ${result.modifiedCount} packages to be Active.`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixPackages();
