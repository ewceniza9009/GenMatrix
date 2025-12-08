import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const check = async () => {
    await mongoose.connect(MONGO_URI);
    const users = await User.find({});
    console.log('Users found:', users.length);
    users.forEach(u => {
        console.log(`User: ${u.username}, Email: ${u.email}, HashLen: ${u.password?.length}`);
    });
    process.exit();
};

check();
