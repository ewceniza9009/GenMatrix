
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'x:/mlm/backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

// Define minimal schemas to avoid import issues
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const walletSchema = new mongoose.Schema({}, { strict: false });
const Wallet = mongoose.model('Wallet', walletSchema);

const configSchema = new mongoose.Schema({}, { strict: false });
const SystemConfig = mongoose.model('SystemConfig', configSchema);

const packageSchema = new mongoose.Schema({}, { strict: false });
const Package = mongoose.model('Package', packageSchema);

const analyze = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const admin = await User.findOne({ username: 'admin' });
        const wallet = await Wallet.findOne({ userId: admin._id });
        const config = await SystemConfig.findOne().sort({ createdAt: -1 });

        console.log('--- SYSTEM CONFIG ---');
        console.log(JSON.stringify(config, null, 2));

        console.log('\n--- ADMIN WALLET ---');
        console.log('Balance:', wallet?.balance);
        console.log('Transactions:', JSON.stringify(wallet?.transactions, null, 2));

        console.log('\n--- USERS ---');
        const users = ['admin', 'a1', 'a2', 'a3', 'a4', 'a11'];
        for (const u of users) {
            const user = await User.findOne({ username: u });
            let pkg = null;
            if (user && user.enrollmentPackage) {
                pkg = await Package.findById(user.enrollmentPackage);
            }

            if (user) {
                console.log(`User: ${user.username} | Sponsor: ${user.sponsorId} | PV: L${user.currentLeftPV}/R${user.currentRightPV} | Pkg: ${pkg ? pkg.name + ' ($' + pkg.price + ', ' + pkg.pv + 'PV)' : 'None'}`);
            } else {
                console.log(`User ${u} not found`);
            }
        }

        process.exit();
    } catch (e) { console.error(e); process.exit(1); }
};

analyze();
