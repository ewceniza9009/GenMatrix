// ---- File: backend/services/seederService.ts ----

import User from '../models/User';
import Commission from '../models/Commission';
import Wallet from '../models/Wallet';
import Package from '../models/Package';
import spilloverService from './spilloverService';
import { CommissionEngine } from './CommissionEngine';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  try {
    // 1. SAFETY CHECK: Do not seed if users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('⚡ Database already populated. Skipping seed.');
      return;
    }

    console.log('🌱 Database empty. Starting automated seed...');

    // 2. Clear related collections (just in case partial data exists)
    await Commission.deleteMany({});
    await Wallet.deleteMany({});
    await Package.deleteMany({});

    // 3. Seed Packages
    const starterPkg = await new Package({
        name: 'Starter',
        price: 100,
        pv: 100,
        description: 'Basic entry package',
        bonuses: [
            { type: 'Direct', value: 10 }
        ]
    }).save();
    console.log('   - Created Starter Package');

    const password = await bcrypt.hash('password', 10);

    // 4. Create System Admin
    const admin = new User({
      username: 'admin',
      email: 'admin@demo.com',
      password,
      rank: 'Diamond',
      role: 'admin',
      isActive: true
    });
    await admin.save();
    console.log('   - Created Admin');

    // 5. Create Root Distributor
    const root = new User({
      username: 'root',
      email: 'root@demo.com',
      password,
      rank: 'Diamond',
      role: 'distributor',
      isActive: true,
      spilloverPreference: 'weaker_leg',
      enrollmentPackage: starterPkg._id
    });
    await root.save();
    
    // Init Financials for Root
    await new Wallet({ userId: root._id, balance: 5000 }).save();
    await new Commission({ userId: root._id, totalEarned: 12000 }).save();
    console.log('   - Created Root Distributor');

    // 6. Create Leaders (Using Spillover Service)
    const leftLeader = new User({
      username: 'left_leader',
      email: 'left@demo.com',
      password,
      rank: 'Gold',
      sponsorId: root._id,
      enrollmentPackage: starterPkg._id
    });
    await spilloverService.placeUser(leftLeader, root.id);

    const rightLeader = new User({
      username: 'right_leader',
      email: 'right@demo.com',
      password,
      rank: 'Gold',
      sponsorId: root._id,
      enrollmentPackage: starterPkg._id
    });
    await spilloverService.placeUser(rightLeader, root.id);
    console.log('   - Created Left/Right Leaders');

    // 7. Create Downline Users
    const users = [
      { name: 'user_l1', sponsor: 'left_leader', rank: 'Silver' },
      { name: 'user_l2', sponsor: 'left_leader', rank: 'Bronze' },
      { name: 'user_r1', sponsor: 'right_leader', rank: 'Silver' },
      { name: 'user_r2', sponsor: 'right_leader', rank: 'Bronze' },
    ];

    for (const u of users) {
      const sponsor = await User.findOne({ username: u.sponsor });
      if (sponsor) {
        const newUser = new User({
          username: u.name,
          email: `${u.name}@demo.com`,
          password,
          rank: u.rank as any,
          enrollmentPackage: starterPkg._id
        });
        const savedUser = await spilloverService.placeUser(newUser, sponsor.id);
        
        // Initialize wallet/commission for them
        await new Wallet({ userId: savedUser._id }).save();
        await new Commission({ userId: savedUser._id }).save();

        // Simulate PV
        await CommissionEngine.updateUplinePV(savedUser._id.toString(), 100);
      }
    }

    console.log('✅ Automated Seeding Complete');

  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    // Don't exit process here, just log error so server keeps running
  }
};