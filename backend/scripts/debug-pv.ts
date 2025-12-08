import mongoose from 'mongoose';
import User from '../models/User';
import Package from '../models/Package';
import spilloverService from '../services/spilloverService';
import { CommissionEngine } from '../services/CommissionEngine';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const debug = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // 1. Get Admin (Root)
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) throw new Error('Admin not found');
    console.log(`Admin Initial PV: Left=${admin.currentLeftPV}, Right=${admin.currentRightPV}`);

    // 2. Create a test user
    const pkg = await Package.findOne({ name: 'Starter' });
    if (!pkg) throw new Error('Starter package not found');
    console.log(`Found Package: ${pkg.name} (${pkg.pv} PV)`);

    const newUser = new User({
        username: `test_pv_${Date.now()}`,
        email: `test_pv_${Date.now()}@example.com`,
        password: 'pass',
        enrollmentPackage: pkg._id
    });

    // 3. Place under Admin
    // Using admin as sponsor
    const savedUser = await spilloverService.placeUser(newUser, admin.id);
    console.log(`Placed ${savedUser.username} under Admin. Position: ${savedUser.position}`);
    
    // Verify parent
    const parent = await User.findById(savedUser.parentId);
    console.log(`Parent of new user is: ${parent?.username}`);
    if (parent?.id !== admin.id) {
        console.log('NOTE: Parent is NOT admin (spillover happened?). Adjusting check target.');
    }

    // 4. Trigger PV Update
    console.log('Triggering PV Update...');
    await CommissionEngine.updateUplinePV(savedUser._id.toString(), pkg.pv);

    // 5. Check Admin Again
    const updatedAdmin = await User.findById(admin._id); // Reload
    console.log(`Admin Updated PV: Left=${updatedAdmin?.currentLeftPV}, Right=${updatedAdmin?.currentRightPV}`);
    
    if (updatedAdmin!.currentLeftPV > admin.currentLeftPV || updatedAdmin!.currentRightPV > admin.currentRightPV) {
        console.log('SUCCESS: PV increased.');
    } else {
        console.log('FAILURE: PV did not change.');
    }

    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

debug();
