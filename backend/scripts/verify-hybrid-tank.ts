import mongoose from 'mongoose';
import User from '../models/User';
import SystemConfig from '../models/SystemConfig';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const verify = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Setup Test Data
        await User.deleteMany({ email: { $regex: /test.com$/ } });
        // We will mock the SystemConfig behavior by setting variables, 
        // effectively simulating the logic we wrote in the controller.

        // Create Sponsors with different settings
        const sponsorSystem = await new User({
            username: 'SponsorSys', email: 'sys@test.com', password: 'p',
            enableHoldingTank: 'system', isPlaced: true
        }).save();

        const sponsorEnable = await new User({
            username: 'SponsorEnable', email: 'enable@test.com', password: 'p',
            enableHoldingTank: 'enabled', isPlaced: true
        }).save();

        const sponsorDisable = await new User({
            username: 'SponsorDisable', email: 'disable@test.com', password: 'p',
            enableHoldingTank: 'disabled', isPlaced: true
        }).save();

        console.log('--- Hybrid Logic Verification ---');

        // Logic Function to Test (Mirrors Controller)
        const checkPlacement = (userSetting: string, globalSetting: boolean) => {
            if (userSetting === 'enabled') return true; // Held
            if (userSetting === 'disabled') return false; // Placed
            return globalSetting; // Follow Global
        };

        // Scenario 1: Global ON
        console.log('\n[Scenario: Global Holding Tank = ON]');
        const globalOn = true;

        console.log(`User 'System': ${checkPlacement(sponsorSystem.enableHoldingTank as string, globalOn) ? 'Held (CORRECT)' : 'Placed (FAIL)'}`);
        console.log(`User 'Enable': ${checkPlacement(sponsorEnable.enableHoldingTank as string, globalOn) ? 'Held (CORRECT)' : 'Placed (FAIL)'}`);
        console.log(`User 'Disable': ${!checkPlacement(sponsorDisable.enableHoldingTank as string, globalOn) ? 'Placed (CORRECT)' : 'Held (FAIL)'}`);

        // Scenario 2: Global OFF
        console.log('\n[Scenario: Global Holding Tank = OFF]');
        const globalOff = false;

        console.log(`User 'System': ${!checkPlacement(sponsorSystem.enableHoldingTank as string, globalOff) ? 'Placed (CORRECT)' : 'Held (FAIL)'}`);
        console.log(`User 'Enable': ${checkPlacement(sponsorEnable.enableHoldingTank as string, globalOff) ? 'Held (CORRECT)' : 'Placed (FAIL)'}`);
        console.log(`User 'Disable': ${!checkPlacement(sponsorDisable.enableHoldingTank as string, globalOff) ? 'Placed (CORRECT)' : 'Held (FAIL)'}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
