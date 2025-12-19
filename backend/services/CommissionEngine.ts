import User, { IUser } from '../models/User';
import Wallet from '../models/Wallet';
import Commission from '../models/Commission';
import SystemConfig from '../models/SystemConfig';
import { createNotification } from '../controllers/notificationController';
import mongoose from 'mongoose';

export class CommissionEngine {

  // 1. Referral Bonus: Dynamic % based on System Config
  static async distributeReferralBonus(sponsorId: string, newUserId: string, packagePrice: number, session?: mongoose.ClientSession) {
    const sponsor = await User.findById(sponsorId).session(session || null);
    if (!sponsor) return;

    // Load Config
    const config = await (SystemConfig as any).getLatest();
    const percent = config.referralBonusPercentage || 10;
    const bonusAmount = packagePrice * (percent / 100);

    // Credit Wallet
    let wallet = await Wallet.findOne({ userId: sponsor._id }).session(session || null);
    if (!wallet) {
      wallet = new Wallet({ userId: sponsor._id, balance: 0 });
    }

    // Get User Name for Description
    const newUser = await User.findById(newUserId);
    const newUserName = newUser ? newUser.username : newUserId;

    wallet.balance += bonusAmount;
    wallet.transactions.push({
      amount: bonusAmount,
      type: 'COMMISSION',
      description: `Referral Bonus for recruit ${newUserName}`,
      date: new Date(),
      status: 'COMPLETED'
    });
    await wallet.save({ session });

    // Update Commission Record
    let commission = await Commission.findOne({ userId: sponsor._id }).session(session || null);
    if (!commission) {
      commission = new Commission({ userId: sponsor._id, totalEarned: 0 });
    }
    commission.totalEarned += bonusAmount;
    commission.history.push({
      amount: bonusAmount,
      type: 'DIRECT_REFERRAL',
      relatedUserId: newUserId as any,
      date: new Date(),
      details: 'Direct Referral Signup'
    });
    await commission.save();

    await commission.save({ session });

    // NOTIFY
    await createNotification(
      sponsor._id.toString(),
      'success',
      'Direct Referral Commission',
      `You earned $${bonusAmount.toFixed(2)} for referring a new member!`
    );

    console.log(`[CommissionEngine] Referral Bonus: $${bonusAmount} to ${sponsor.username}`);
  }

  // 2. Binary Pairing Logic (Dynamic from SystemConfig)
  static async runBinaryPairing(userId: string, session?: mongoose.ClientSession) {
    const user = await User.findById(userId).session(session || null);
    if (!user) return;

    // LOAD CONFIG
    const config = await (SystemConfig as any).getLatest(); // Cast to any to access static
    const PAIR_UNIT = config.pairUnit || 100;
    const COMMISSION = config.commissionValue || 10;
    const DAILY_CAP = config.dailyCapAmount || 500;
    const RATIO = config.pairRatio || '1:1';

    let left = user.currentLeftPV;
    let right = user.currentRightPV;

    let pairs = 0;
    let usedLeft = 0;
    let usedRight = 0;

    // --- RATIO LOGIC ---
    if (RATIO === '1:1') {
      const possibleLeft = Math.floor(left / PAIR_UNIT);
      const possibleRight = Math.floor(right / PAIR_UNIT);
      pairs = Math.min(possibleLeft, possibleRight);
      usedLeft = pairs * PAIR_UNIT;
      usedRight = pairs * PAIR_UNIT;
    }
    else if (RATIO === '1:2') {
      // 1 part Left, 2 parts Right
      // Check max pairs based on Left
      // Check max pairs based on Right (divided by 2 parts)
      const possibleLeft = Math.floor(left / PAIR_UNIT);
      const possibleRight = Math.floor(right / (PAIR_UNIT * 2));
      pairs = Math.min(possibleLeft, possibleRight);
      usedLeft = pairs * PAIR_UNIT;
      usedRight = pairs * (PAIR_UNIT * 2);

      // If no pairs, try REVERSE (2:1)? Some systems allow 1:2 OR 2:1 automatically.
      // For strictest Epixel definition, 1:2 means Left=1 Unit, Right=2 Units.
      // Often '1:2 or 2:1' means "Weak leg * 2 <= Strong Leg"
      if (pairs === 0) {
        // Try Swap logic if supported (2:1 check)

        // ... logic loop ... 
        // keeping simple for now as per specific request
      }
    }
    else if (RATIO === '2:1') {
      const possibleLeft = Math.floor(left / (PAIR_UNIT * 2));
      const possibleRight = Math.floor(right / PAIR_UNIT);
      pairs = Math.min(possibleLeft, possibleRight);
      usedLeft = pairs * (PAIR_UNIT * 2);
      usedRight = pairs * PAIR_UNIT;
    }

    if (pairs > 0) {
      let payout = pairs * COMMISSION;

      // --- CAPPING LOGIC (FLASHOUT) ---
      // Real implementation should check *todays* earnings from history, 
      // but simple version is capped per transaction for demo.
      // Ideally: const todayEarnings = await Commission.getDailyEarnings(userId);
      let isCapped = false;
      if (payout > DAILY_CAP) {
        payout = DAILY_CAP;
        isCapped = true;
      }

      // Update User PV (Flush used PV)
      user.currentLeftPV -= usedLeft;
      user.currentRightPV -= usedRight;
      await user.save({ session });

      // Credit Wallet
      await this.creditWallet(user._id.toString(), payout, 'BINARY_BONUS', `Matched ${pairs} pairs (${RATIO}).${isCapped ? ' (Capped)' : ''}`, session);

      // Update Commission Stats
      await this.updateCommissionStats(user._id.toString(), payout, 'BINARY_BONUS', session);

      // --- TRIGGER MATCHING BONUS ---
      if (payout > 0) {
        await this.distributeMatchingBonus(user._id.toString(), payout, session);
      }

      // --- CHECK RANK ADVANCEMENT ---
      await this.checkRankAdvancement(user, session);

      // NOTIFY
      await createNotification(
        user._id.toString(),
        'success',
        'Binary Commission',
        `You matched ${pairs} pair(s) and earned $${payout.toFixed(2)}!`
      );

      console.log(`[CommissionEngine] User ${user.username}: Matched ${pairs} pairs (${RATIO}). Payout $${payout}.`);
    }
  }

  // 3. Matching Bonus (Dynamic Generations from Config)
  static async distributeMatchingBonus(earnerId: string, binaryIncome: number, session?: mongoose.ClientSession) {
    // Load Config
    const config = await (SystemConfig as any).getLatest();
    const rawGenerations = config.matchingBonusGenerations && config.matchingBonusGenerations.length > 0
      ? config.matchingBonusGenerations
      : [10, 5, 2];

    // Convert 10 -> 0.10
    const generations = rawGenerations.map((g: number) => g / 100);

    let currentUser = await User.findById(earnerId).session(session || null);
    let currentLevel = 0;

    // Traverse up the SPONSOR tree
    while (currentUser && currentUser.sponsorId && currentLevel < generations.length) {
      const sponsor = await User.findById(currentUser.sponsorId).session(session || null);
      if (!sponsor) break;

      const bonusAmount = binaryIncome * generations[currentLevel];

      if (bonusAmount > 0) {
        await this.creditWallet(
          sponsor._id.toString(),
          bonusAmount,
          'MATCHING_BONUS',
          `Matching bonus (${(generations[currentLevel] * 100)}%) from ${currentUser.username}'s binary income`,
          session
        );
        await this.updateCommissionStats(sponsor._id.toString(), bonusAmount, 'MATCHING_BONUS', session);

        // NOTIFY
        await createNotification(
          sponsor._id.toString(),
          'success',
          'Matching Bonus',
          `You earned a $${bonusAmount.toFixed(2)} matching bonus from your downline.`
        );
      }

      currentUser = sponsor;
      currentLevel++;
    }
  }

  // 4. Rank Advancement
  static async checkRankAdvancement(user: IUser, session?: mongoose.ClientSession) {
    const commission = await Commission.findOne({ userId: user._id }).session(session || null);
    if (!commission) return;

    const total = commission.totalEarned;
    let newRank = user.rank;

    // Simple Total Earnings based Rank logic
    if (total >= 1000 && user.rank === 'Bronze') newRank = 'Silver';
    else if (total >= 5000 && (user.rank === 'Silver' || user.rank === 'Bronze')) newRank = 'Gold';
    else if (total >= 20000 && user.rank !== 'Diamond') newRank = 'Diamond';

    if (newRank !== user.rank) {
      user.rank = newRank;
      await user.save({ session });

      // One-time Rank Bonus
      const rankBonus = newRank === 'Silver' ? 50 : newRank === 'Gold' ? 200 : 1000;
      await this.creditWallet(user._id.toString(), rankBonus, 'RANK_ACHIEVEMENT', `Promoted to ${newRank}`, session);
      await this.updateCommissionStats(user._id.toString(), rankBonus, 'RANK_ACHIEVEMENT', session);

      // NOTIFY
      await createNotification(
        user._id.toString(),
        'success',
        'Rank Advanced!',
        `Congratulations! You have been promoted to ${newRank} and received a $${rankBonus} bonus.`
      );
    }
  }

  // 5. Update Upline PV
  static async updateUplinePV(userId: string, pvAmount: number, session?: mongoose.ClientSession) {
    let currentUser = await User.findById(userId).session(session || null);

    while (currentUser && currentUser.parentId) {
      const parent = await User.findById(currentUser.parentId).session(session || null);
      if (!parent) break;

      console.log(`[CommissionEngine] Propagating ${pvAmount} PV from ${currentUser.username} to parent ${parent.username}`);
      console.log(`[CommissionEngine] Parent Left: ${parent.leftChildId}, Right: ${parent.rightChildId}`);

      if (parent.leftChildId && parent.leftChildId.toString() === currentUser._id.toString()) {
        console.log(`[CommissionEngine] Adding to Left PV of ${parent.username}`);
        parent.currentLeftPV = (parent.currentLeftPV || 0) + pvAmount;
      } else if (parent.rightChildId && parent.rightChildId.toString() === currentUser._id.toString()) {
        console.log(`[CommissionEngine] Adding to Right PV of ${parent.username}`);
        parent.currentRightPV = (parent.currentRightPV || 0) + pvAmount;
      } else {
        console.warn(`[CommissionEngine] WARNING: ${currentUser.username} thinks ${parent.username} is parent, but parent does not link back correctly!`);
      }
      // @ts-ignore
      await parent.save({ session });

      // Trigger binary check for parent immediately
      await this.runBinaryPairing(parent._id.toString(), session);

      currentUser = parent;
    }
    console.log(`[CommissionEngine] PV Propagated: ${pvAmount} PV up the tree line.`);
  }

  // 6. Add Personal PV (Tracking only)
  static async addPersonalPV(userId: string, pvAmount: number, session?: mongoose.ClientSession) {
    if (pvAmount <= 0) return;
    const user = await User.findById(userId).session(session || null);
    if (!user) return;

    user.personalPV = (user.personalPV || 0) + pvAmount;
    await user.save({ session });
    console.log(`[CommissionEngine] Added ${pvAmount} Personal PV to ${user.username}. Total: ${user.personalPV}`);
  }

  // Helper: Credit Wallet
  private static async creditWallet(userId: string, amount: number, type: string, description: string, session?: mongoose.ClientSession) {
    let wallet = await Wallet.findOne({ userId }).session(session || null);
    if (!wallet) wallet = new Wallet({ userId, balance: 0 });

    wallet.balance += amount;
    wallet.transactions.push({
      type: 'COMMISSION',
      amount,
      date: new Date(),
      description,
      status: 'COMPLETED'
    } as any);
    await wallet.save({ session });
  }

  // Helper: Update Commission Doc
  private static async updateCommissionStats(userId: string, amount: number, type: string, session?: mongoose.ClientSession) {
    let commission = await Commission.findOne({ userId }).session(session || null);
    if (!commission) commission = new Commission({ userId, totalEarned: 0 });
    commission.totalEarned += amount;
    commission.history.push({
      type: type as any,
      amount,
      date: new Date(),
      details: 'Auto-calculated'
    });
    await commission.save({ session });
  }
}