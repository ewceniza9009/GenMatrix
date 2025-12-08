import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const verify = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const users = await User.find({}, 'username email role rank');
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
        console.log(`- ${u.username} (${u.email}) [${u.role}/${u.rank}]`);
    });

    if (users.length === 0) {
        console.log('Database appears empty.');
    } else {
        console.log('Database is seeded.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

verify();
