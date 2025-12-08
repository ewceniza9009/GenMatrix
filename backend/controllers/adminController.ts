import { Request, Response } from 'express';
import User from '../models/User';
import Commission from '../models/Commission';
import { CommissionEngine } from '../services/CommissionEngine';

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const commissions = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEarned' } } }
    ]);
    
    res.json({
      totalUsers,
      totalCommissions: commissions[0]?.total || 0,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

export const runCommissionRun = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ isActive: true });
    let totalPaid = 0;
    
    for (const user of users) {
      // Run binary pairing for each user
      await CommissionEngine.runBinaryPairing(user._id as unknown as string);
    }
    
    res.json({ message: 'Commission Run Completed', usersProcessed: users.length });
  } catch (error) {
    res.status(500).json({ message: 'Commission Run Failed' });
  }
};
