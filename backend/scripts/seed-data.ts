import mongoose from 'mongoose';
import User from '../models/User';
import Commission from '../models/Commission';
import Wallet from '../models/Wallet';
import spilloverService from '../services/spilloverService';
import bcrypt from 'bcryptjs';
import Package from '../models/Package';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Clear existing
    await User.deleteMany({});
    await Commission.deleteMany({});
    await Wallet.deleteMany({});
    await mongoose.connection.collection('packages').deleteMany({}); // Clear packages
    console.log('Cleared DB');

    // 0. Seed Packages
    const starterPkg = await new Package({
        name: 'Starter',
        price: 100,
        pv: 100,
        description: 'Basic entry package',
        bonuses: [
            { type: 'Direct', value: 10 }
        ]
    }).save();
    console.log('Created Starter Package (100 PV)');

    const password = await bcrypt.hash('password', 10);

    // 1. Create System Admin
    const admin = new User({
      username: 'admin',
      email: 'admin@demo.com',
      password,
      rank: 'Diamond',
      role: 'admin', // Explicit Admin Role
      isActive: true
    });
    await admin.save();
    console.log('Created Admin (admin@demo.com / password)');

    // 2. Create RootDistributor
    const root = new User({
      username: 'root',
      email: 'root@demo.com',
      password,
      rank: 'Diamond',
      role: 'distributor',
      isActive: true,
      spilloverPreference: 'weaker_leg'
    });
    await root.save();
    
    // Seed wallet for visual
    await new Wallet({ userId: root._id, balance: 5000 }).save();
    await new Commission({ userId: root._id, totalEarned: 12000 }).save();
    
    console.log('Created Root Distributor');

    // 3. Create Left/Right Leaders
    const leftLeader = new User({
      username: 'left_leader',
      email: 'left@demo.com',
      password,
      rank: 'Gold',
      sponsorId: root._id
    });
    await spilloverService.placeUser(leftLeader, root.id);

    const rightLeader = new User({
      username: 'right_leader',
      email: 'right@demo.com',
      password,
      rank: 'Gold',
      sponsorId: root._id
    });
    await spilloverService.placeUser(rightLeader, root.id);
    console.log('Created Leaders');

    // 4. Create Network
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
          rank: u.rank
        });
        await spilloverService.placeUser(newUser, sponsor.id);
        
        // Add fake PV for commission testing
        sponsor.currentLeftPV += 150;
        await sponsor.save();
        
        console.log(`Placed ${u.name} under ${u.sponsor}`);
      }
    }

    console.log('Seeding Complete');
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
