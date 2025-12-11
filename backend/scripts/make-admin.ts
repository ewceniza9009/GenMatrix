
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const makeAdmin = async () => {
    const username = process.argv[2];

    if (!username) {
        console.error('Please provide a username: npx ts-node scripts/make-admin.ts <username>');
        process.exit(1);
    }

    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';
        await mongoose.connect(MONGO_URI);

        const user = await User.findOne({ username });
        if (!user) {
            console.error(`User ${username} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`SUCCESS: User ${username} is now an Admin.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

makeAdmin();
