import mongoose from 'mongoose';
import User from '../models/User';
import Commission from '../models/Commission';
import Wallet from '../models/Wallet';
import spilloverService from '../services/spilloverService';
import { activateUser } from '../services/userActivationService';
import { placeUserManually } from '../controllers/placementController'; // We will mock Request/Response
import { CommissionEngine } from '../services/CommissionEngine'; // Import engine for checks if needed, but checking DB is enough
import bcrypt from 'bcryptjs';
import Package from '../models/Package';
import SystemSetting from '../models/SystemSetting';
import Product from '../models/Product';
import SystemConfig from '../models/SystemConfig';
import dotenv from 'dotenv';
import Order from '../models/Order'; // Need Order model

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const createMockReq = (body: any, user: any) => ({
    body,
    user,
} as any);

const createMockRes = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.jsonData = data;
        return res;
    };
    return res;
};

const verify = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- TEST START: Shop First Verification ---');

        // 1. CLEANUP
        await User.deleteMany({});
        await Commission.deleteMany({});
        await Wallet.deleteMany({});
        await Order.deleteMany({});
        await SystemSetting.deleteMany({});

        // 2. SETUP SPONSOR (Admin)
        const password = await bcrypt.hash('password', 10);
        const root = await new User({ username: 'root', email: 'root@test.com', password, isActive: true, isPlaced: true, rank: 'Diamond' }).save();
        const sponsor = await new User({ username: 'sponsor', email: 'sponsor@test.com', password, isActive: true, isPlaced: true, sponsorId: root._id, rank: 'Diamond' }).save();

        // Ensure Sponsor has Wallet/Commission
        await new Wallet({ userId: sponsor._id }).save();
        await new Commission({ userId: sponsor._id }).save();

        console.log(`[Setup] Sponsor Created: ${sponsor.username} (${sponsor._id})`);

        // Enable Shop First Holding Tank
        await SystemSetting.create({ key: 'shopFirstHoldingTank', value: true });
        console.log(`[Setup] Shop First Holding Tank ENABLED`);

        // 3. SCENARIO 1: Shop First Activation -> Holding Tank
        console.log(`\n--- SCENARIO 1: Activation (Shop First) ---`);
        const newUser = await new User({
            username: 'shopUser',
            email: 'shop@test.com',
            password,
            isActive: false,
            isPlaced: false,
            sponsorId: sponsor._id,
            enrollmentDate: new Date()
        }).save();

        // Mock Order (100 PV product)
        const order = await new Order({
            userId: newUser._id,
            status: 'PAID',
            totalAmount: 100,
            items: [{
                productId: new mongoose.Types.ObjectId(),
                name: 'Test Product',
                quantity: 1,
                price: 100,
                pv: 100,
                totalPrice: 100,
                totalPV: 100
            }],
            totalPV: 100
        }).save();

        // Activate
        await activateUser(newUser._id.toString(), 100); // 100 amount triggers Shop First logic

        const userAfterActivation = await User.findById(newUser._id);
        if (userAfterActivation?.status === 'active' && userAfterActivation?.isPlaced === false) {
            console.log('✅ PASS: User activated and placed in Holding Tank (isPlaced: false)');
        } else {
            console.error('❌ FAIL: User not in Holding Tank properly', userAfterActivation);
        }

        // 4. SCENARIO 2: Manual Placement (RIGHT LEG)
        console.log(`\n--- SCENARIO 2: Manual Placement (Right Side) ---`);

        // Mock Request to placeUserManually
        // We want to verify "Right Leg" placement explicitly for empty leg
        const req = createMockReq({
            userId: newUser._id.toString(),
            targetParentId: sponsor._id.toString(),
            position: 'right'
        }, { _id: sponsor._id });

        const res = createMockRes();

        // Start Check of Pre-commission
        const preComm = await Commission.findOne({ userId: sponsor._id });
        console.log(`[Pre-Place] Sponsor Balance: 0 (Assumed)`);

        // CALL CONTROLLER
        await placeUserManually(req, res);

        // Verify Response
        if (res.statusCode && res.statusCode !== 200) {
            console.error('❌ FAIL: Placement Controller returned error', res.jsonData);
        } else {
            console.log('✅ PASS: Placement Controller returned success');
        }

        // Verify DB State
        const placedUser = await User.findById(newUser._id);
        const updatedSponsor = await User.findById(sponsor._id);

        if (placedUser?.isPlaced === true) {
            console.log('✅ PASS: User isPlaced = true');
        } else {
            console.error('❌ FAIL: User isPlaced is STILL FALSE');
        }

        if (placedUser?.parentId?.toString() === sponsor._id.toString()) {
            console.log('✅ PASS: User parentId is correct');
        } else {
            console.error('❌ FAIL: User parentId is wrong');
        }

        if (placedUser?.position === 'right') {
            console.log('✅ PASS: User position is RIGHT');
        } else {
            console.error('❌ FAIL: User position is wrong:', placedUser?.position);
        }

        if (updatedSponsor?.rightChildId?.toString() === placedUser?._id.toString()) {
            console.log('✅ PASS: Sponsor rightChildId link is correct');
        } else {
            console.error('❌ FAIL: Sponsor rightChildId is missing or wrong', updatedSponsor);
        }


        // 5. SCENARIO 3: Commission Verification
        console.log(`\n--- SCENARIO 3: Commission Verification ---`);

        // Verify Referral Bonus ($10 for 100 PV package)
        const wallet = await Wallet.findOne({ userId: sponsor._id });
        console.log(`[Post-Place] Sponsor Wallet Balance: ${wallet?.balance}`);

        if (wallet?.balance === 10) {
            console.log('✅ PASS: Correct Referral Bonus ($10)');
        } else {
            console.warn(`WARNING: Balance is ${wallet?.balance}, expected 10.`);
        }

        // 6. SCENARIO 4: Double Submission Safety
        console.log(`\n--- SCENARIO 4: Double Submission Safety ---`);
        const res2 = createMockRes();
        await placeUserManually(req, res2); // Attempt duplicate placement

        if (res2.statusCode === 400) {
            console.log('✅ PASS: Duplicate placement blocked');
        } else {
            console.error('❌ FAIL: Duplicate placement allowed!', res2.jsonData);
        }

        // Verify Balance Unchanged
        const walletFinal = await Wallet.findOne({ userId: sponsor._id });
        if (walletFinal?.balance === wallet?.balance) {
            console.log('✅ PASS: Wallet balance unchanged (No double bonus)');
        } else {
            console.error('❌ FAIL: Wallet balance increased!', walletFinal?.balance);
        }

        // 7. SCENARIO 5: Auto Place (Holding Tank DISABLED)
        console.log(`\n--- SCENARIO 5: Auto Place (Holding Tank DISABLED) ---`);
        await SystemSetting.findOneAndUpdate({ key: 'shopFirstHoldingTank' }, { value: false });
        console.log(`[Setup] Shop First Holding Tank DISABLED`);

        const autoUserNew = await new User({
            username: 'autoUser',
            email: 'auto@test.com',
            password,
            isActive: false,
            isPlaced: false,
            sponsorId: sponsor._id,
            enrollmentDate: new Date()
        }).save();

        // Create Order & Activate
        await new Order({
            userId: autoUserNew._id,
            status: 'PAID',
            totalAmount: 100,
            items: [{ productId: new mongoose.Types.ObjectId(), name: 'Test Product', quantity: 1, price: 100, pv: 100, totalPrice: 100, totalPV: 100 }],
            totalPV: 100
        }).save();

        await activateUser(autoUserNew._id.toString(), 100);

        const placedAutoUser = await User.findById(autoUserNew._id);
        if (placedAutoUser?.isPlaced === true && placedAutoUser?.parentId) {
            console.log('✅ PASS: User automatically placed with parentId');
        } else {
            console.error('❌ FAIL: User NOT placed automatically', placedAutoUser);
        }

        // 8. SCENARIO 6: Extreme Strategies (Left/Right)
        console.log(`\n--- SCENARIO 6: Extreme Strategies ---`);

        // Test Extreme Left
        const leftUser = await new User({ username: 'leftUser', email: 'left@test.com', password, isActive: true, isPlaced: false, sponsorId: sponsor._id }).save();
        const p1 = await spilloverService.placeUser(leftUser as any, sponsor._id.toString(), 'extreme_left');

        // Check if placed correctly (Under AutoUser from Scenario 5)
        const autoUser = await User.findOne({ username: 'autoUser' });
        if (autoUser && p1.parentId?.toString() === autoUser._id.toString() && p1.position === 'left') {
            console.log('✅ PASS: Extreme Left -> Spilled over under AutoUser');
        } else if (p1.parentId?.toString() === sponsor._id.toString() && p1.position === 'left') {
            console.log('✅ PASS: Extreme Left -> Sponsor Left (If AutoUser failed)');
        } else {
            console.error('❌ FAIL: Extreme Left Placement', p1);
        }

        // Test Extreme Left Depth 2
        const leftUser2 = await new User({ username: 'leftUser2', email: 'left2@test.com', password, isActive: true, isPlaced: false, sponsorId: sponsor._id }).save();
        const p2 = await spilloverService.placeUser(leftUser2 as any, sponsor._id.toString(), 'extreme_left');

        if (p2.parentId?.toString() === p1._id.toString() && p2.position === 'left') {
            console.log('✅ PASS: Extreme Left (Depth 2) -> p1 Left');
        } else {
            console.error('❌ FAIL: Extreme Left (Depth 2)', p2);
        }

        // Test Extreme Right
        const rightUser2 = await new User({ username: 'rightUser2', email: 'right2@test.com', password, isActive: true, isPlaced: false, sponsorId: sponsor._id }).save();
        const p3 = await spilloverService.placeUser(rightUser2 as any, sponsor._id.toString(), 'extreme_right');

        const placedShopUser = await User.findOne({ username: 'shopUser' }); // Placed on Right in Scenario 2
        if (p3.parentId?.toString() === placedShopUser?._id.toString() && p3.position === 'right') {
            console.log('✅ PASS: Extreme Right -> Placed under ShopUser (Right side)');
        } else {
            console.error('❌ FAIL: Extreme Right Placement', p3);
        }

        // 9. SCENARIO 7: Alternate (Balanced) Strategy
        console.log(`\n--- SCENARIO 7: Alternate (Balanced) Strategy ---`);

        // Setup new tree for clean test
        const altSponsor = await new User({ username: 'altSponsor', email: 'alt@test.com', password, isActive: true, isPlaced: true, rank: 'Diamond' }).save();

        // 1. Create Imbalance (Place 1 on Left)
        const altLeft = await new User({ username: 'altLeft', email: 'altleft@test.com', password, isActive: true, isPlaced: false, sponsorId: altSponsor._id }).save();
        await spilloverService.placeUser(altLeft as any, altSponsor._id.toString(), 'extreme_left');

        // 2. Test Alternate -> Should go Right (smaller side)
        const altUser1 = await new User({ username: 'alt1', email: 'alt1@test.com', password, isActive: true, isPlaced: false, sponsorId: altSponsor._id }).save();
        const pAlt1 = await spilloverService.placeUser(altUser1 as any, altSponsor._id.toString(), 'alternate');

        if (pAlt1.position === 'right' && pAlt1.parentId?.toString() === altSponsor._id.toString()) {
            console.log('✅ PASS: Alternate -> Filled Empty Right Leg');
        } else {
            console.error('❌ FAIL: Alternate did not fill right leg', pAlt1);
        }

        // 3. Test Tie (Left=1, Right=1) -> Should default to Left
        const altUser2 = await new User({ username: 'alt2', email: 'alt2@test.com', password, isActive: true, isPlaced: false, sponsorId: altSponsor._id }).save();
        const pAlt2 = await spilloverService.placeUser(altUser2 as any, altSponsor._id.toString(), 'alternate');

        if (pAlt2.position === 'left' && pAlt2.parentId?.toString() === altLeft._id.toString()) {
            console.log('✅ PASS: Alternate (Tie) -> Went Left');
        } else {
            console.error('❌ FAIL: Alternate (Tie) Failed', pAlt2);
        }

        // 4. Test Imbalance (Left=2, Right=1) -> Should go Right
        const altUser3 = await new User({ username: 'alt3', email: 'alt3@test.com', password, isActive: true, isPlaced: false, sponsorId: altSponsor._id }).save();
        const pAlt3 = await spilloverService.placeUser(altUser3 as any, altSponsor._id.toString(), 'alternate');

        // Note: Filling Right Side means placing under 'altUser1' (Sponsor's Right Child).
        // traverseToFirstEmpty fills the LEFT child of the target node first.
        if (pAlt3.position === 'left' && pAlt3.parentId?.toString() === altUser1._id.toString()) {
            console.log('✅ PASS: Alternate (Imbalanced) -> Filled Right Side (Left Child of Right Node)');
        } else {
            console.error('❌ FAIL: Alternate (Imbalanced) Failed', pAlt3);
        }

        console.log('\n--- TESTS COMPLETE ---');
        process.exit(0);

    } catch (err) {
        console.error('CRASH:', err);
        process.exit(1);
    }
};

verify();
