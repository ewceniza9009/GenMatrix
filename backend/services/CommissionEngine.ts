import User, { IUser } from '../models/User';
import Wallet from '../models/Wallet';
import Commission from '../models/Commission';

export class CommissionEngine {
  
  // 1. Referral Bonus: 10% of Package Price (Fixed $10 for demo packages)
  // Triggered immediately upon registration
  static async distributeReferralBonus(sponsorId: string, newUserId: string) {
    const sponsor = await User.findById(sponsorId);
    if (!sponsor) return;

    // In a real app, fetch package price. Here assuming flat $10 referral.
    const bonusAmount = 10.00;

    // Credit Wallet
    let wallet = await Wallet.findOne({ userId: sponsor._id });
    if (!wallet) {
      wallet = new Wallet({ userId: sponsor._id, balance: 0 });
    }
    wallet.balance += bonusAmount;
    wallet.transactions.push({
      amount: bonusAmount,
      type: 'COMMISSION',
      description: `Referral Bonus for new user ${newUserId}`,
      date: new Date(),
      status: 'COMPLETED'
    });
    await wallet.save();

    // Update Commission Record
    let commission = await Commission.findOne({ userId: sponsor._id });
    if (!commission) {
      commission = new Commission({ userId: sponsor._id, totalEarned: 0 });
    }
    commission.totalEarned += bonusAmount;
    commission.history.push({
        amount: bonusAmount,
        type: 'DIRECT_REFERRAL',
        relatedUserId: newUserId as any,
        date: new Date()
    });
    await commission.save();
    
    console.log(`[CommissionEngine] Referral Bonus: $${bonusAmount} to ${sponsor.username}`);
  }

  // 2. Binary Pairing Logic (1:1 Ratio)
  // This would typically run as a cron job or triggered manually by Admin
  static async runBinaryPairing(userId: string) {
    const user = await User.findById(userId);
    if (!user) return;

    const left = user.currentLeftPV;
    const right = user.currentRightPV;
    
    // Logic: 1 Pair = 100 PV Left + 100 PV Right = $10 Commission
    // Find matching pairs
    const pairUnit = 100;
    const commissionPerPair = 10;
    
    const possibleLeftPairs = Math.floor(left / pairUnit);
    const possibleRightPairs = Math.floor(right / pairUnit);
    
    const pairs = Math.min(possibleLeftPairs, possibleRightPairs);
    
    if (pairs > 0) {
      const payout = pairs * commissionPerPair;
      const flushedPV = pairs * pairUnit;

      // Update User PV (Flush used PV)
      user.currentLeftPV -= flushedPV;
      user.currentRightPV -= flushedPV;
      await user.save();

      // Credit Wallet
      let wallet = await Wallet.findOne({ userId: user._id });
      if (!wallet) wallet = new Wallet({ userId: user._id });
      
      wallet.balance += payout;
      wallet.transactions.push({
        amount: payout,
        type: 'COMMISSION',
        description: `Binary Commission: ${pairs} pairs matched`,
        date: new Date(),
        status: 'COMPLETED'
      });
      await wallet.save();

      // Update Commission Stats
      let commission = await Commission.findOne({ userId: user._id });
      if (!commission) commission = new Commission({ userId: user._id });
      commission.totalEarned += payout;
      await commission.save();

      console.log(`[CommissionEngine] User ${user.username}: Matched ${pairs} pairs. Payout $${payout}.`);
    }
  }

  // 3. Propagate PV Up the Tree
  // Called when a user makes a purchase or joins (Simulated 100 PV for Signup)
  static async updateUplinePV(userId: string, pvAmount: number) {
    let currentUser = await User.findById(userId);
    
    // Traverse up using parentId (strict tree parent, not sponsor)
    while (currentUser && currentUser.parentId) {
      const parent = await User.findById(currentUser.parentId);
      if (!parent) break;

      // Determine which leg the current user is on relative to the parent
      if (parent.leftChildId && parent.leftChildId.toString() === currentUser._id.toString()) {
        parent.currentLeftPV += pvAmount;
      } else if (parent.rightChildId && parent.rightChildId.toString() === currentUser._id.toString()) {
        parent.currentRightPV += pvAmount;
      }
      
      await parent.save();
      
      // Move up
      currentUser = parent;
    }
    console.log(`[CommissionEngine] PV Propagated: ${pvAmount} PV up the tree line.`);
  }
}
