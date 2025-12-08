const mongoose = require('mongoose');
const User = require('../models/User');
const Commission = require('../models/Commission');
const Package = require('../models/Package');
const Wallet = require('../models/Wallet');
const spilloverService = require('../services/spilloverService');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm_test';

const runVerification = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Test DB');

    // Cleanup
    await User.deleteMany({});
    await Commission.deleteMany({});
    await Wallet.deleteMany({});
    
    console.log('Cleaned DB');

    // 1. Create Root
    const root = new User({ username: 'root', email: 'root@test.com', password: 'hash', rank: 'Diamond' });
    await root.save();
    console.log('Root created:', root._id);

    // 2. Add Left Child (Direct)
    const leftUser = new User({ username: 'left1', email: 'left1@test.com', password: 'hash' });
    // Simulate auth controller placement logic manually or use service if we want to test service purely
    // But service placeUser logic is what we want.
    // Let's use placeUser with "left" preference
    
    // Set root preference to left
    root.spilloverPreference = 'extreme_left';
    await root.save();

    await spilloverService.placeUser(leftUser, root._id);
    console.log('Placed Left1:', leftUser.position, leftUser.parentId);

    // 3. Add Right Child (Direct) - Change preference
    root.spilloverPreference = 'extreme_right';
    await root.save();
    
    const rightUser = new User({ username: 'right1', email: 'right1@test.com', password: 'hash' });
    await spilloverService.placeUser(rightUser, root._id);
    console.log('Placed Right1:', rightUser.position, rightUser.parentId);

    // 4. Add Spillover (Left side again)
    root.spilloverPreference = 'extreme_left';
    await root.save();
    
    const spillover1 = new User({ username: 'spill1', email: 'spill1@test.com', password: 'hash' });
    await spilloverService.placeUser(spillover1, root._id);
    console.log('Placed Spill1:', spillover1.position, 'Parent:', spillover1.parentId);

    // Verify Spillover1 is child of Left1
    if (spillover1.parentId.toString() === leftUser._id.toString() && spillover1.position === 'left') {
      console.log('SUCCESS: Spillover1 correctly placed under Left1');
    } else {
      console.error('FAILURE: Spillover1 misplaced');
    }

    // 5. Test Weaker Leg (Balanced)
    // Currently counts are 0 PV, so it checks existence.
    // Root has L (Left1 -> Spill1) and R (Right1).
    // Left side has depth 2. Right side has depth 1.
    // Weaker leg should be Right.
    
    root.spilloverPreference = 'weaker_leg'; // Our logic in service checks PV or structure
    await root.save();
    
    const balanceUser = new User({ username: 'bal1', email: 'bal1@test.com', password: 'hash' });
    // We need to mock Commission PV or rely on structural check in service
    // Service "traverseToFirstEmpty" does BFS? No, "findPlacement" checks PV.
    // If PV is 0, it defaults to traverseToFirstEmpty logic?
    // In service: if (leftPV <= rightPV) traverseToFirstEmpty(left); else right.
    // Since PV is 0 and 0, it goes Left? 
    // Wait, 0 <= 0 is true. So it goes Left.
    // If we want it to go Right, we should give Left some PV.
    
    // update Commission for root (actually service checks Commission provided logic)
    // The service `findPlacement` fetches Commission for sponsor.
    // Let's create commission for Root and set params.
    const rootComm = new Commission({ userId: root._id, leftLegPV: 100, rightLegPV: 0 }); 
    await rootComm.save();
    
    // Now LeftPV (100) > RightPV (0).
    // Logic: if (left <= right) ... else ...
    // 100 <= 0 is False. So it goes Right.
    
    await spilloverService.placeUser(balanceUser, root._id);
    console.log('Placed Bal1:', balanceUser.position, 'Parent:', balanceUser.parentId);
    
    if (balanceUser.parentId.toString() === rightUser._id.toString()) { // Should go under Right1 as it's the first empty spot on Right leg
       console.log('SUCCESS: Balanced User went to Weaker Leg (Right)');
    } else if (balanceUser.parentId.toString() === root._id.toString() && balanceUser.position === 'right') {
       // It could be direct child if Right1 didn't exist, but Right1 exists.
       console.log('Check: Parent is', balanceUser.parentId);
    } else {
       console.error('FAILURE: Balanced User misplaced');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
};

runVerification();
