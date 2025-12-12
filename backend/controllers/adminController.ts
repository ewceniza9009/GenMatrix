import { Request, Response } from 'express';
import User from '../models/User';
import Commission from '../models/Commission';
import SystemLog from '../models/SystemLog';
import { CommissionEngine } from '../services/CommissionEngine';
import { getPaginationParams, buildSort, buildSearch } from '../utils/queryHelpers';

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

export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || 'timestamp';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const format = req.query.format as string; // 'csv' or 'json'

    const query: any = {};
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    if (format === 'csv') {
      const logs = await SystemLog.find(query).sort({ [sortBy]: sortOrder });
      // Simple CSV conversion
      const csv = [
        'Timestamp,Type,Action,Details',
        ...logs.map(log => `"${log.timestamp.toISOString()}","${log.type}","${log.action}","${log.details.replace(/"/g, '""')}"`)
      ].join('\n');

      res.header('Content-Type', 'text/csv');
      res.attachment('system_logs.csv');
      return res.send(csv);
    }

    const total = await SystemLog.countDocuments(query);
    const logs = await SystemLog.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

export const getCommissionsHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || 'date';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const format = req.query.format as string;

    // Base Aggregation Pipeline
    const pipeline: any[] = [
      { $unwind: '$history' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          amount: '$history.amount',
          type: '$history.type',
          date: '$history.date',
          details: '$history.details'
        }
      }
    ];

    // Apply Search
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { type: { $regex: search, $options: 'i' } },
            { details: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Handle CSV Export (No Pagination)
    if (format === 'csv') {
      pipeline.push({ $sort: { [sortBy]: sortOrder } });
      const results = await Commission.aggregate(pipeline);

      const csv = [
        'Date,User,Type,Amount,Details',
        ...results.map(r => `"${new Date(r.date).toISOString()}","${r.username}","${r.type}","${r.amount}","${r.details.replace(/"/g, '""')}"`)
      ].join('\n');

      res.header('Content-Type', 'text/csv');
      res.attachment('commissions.csv');
      return res.send(csv);
    }

    // Pagination Facet
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { [sortBy]: sortOrder } },
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ]
      }
    });

    const result = await Commission.aggregate(pipeline);
    const data = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching commission history' });
  }
};

export const runCommissionRun = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ isActive: true });

    await SystemLog.create({
      action: 'COMMISSION_RUN_START',
      details: `Started payout cycle for ${users.length} active users.`,
      type: 'INFO'
    });

    for (const user of users) {
      await CommissionEngine.runBinaryPairing(user._id as unknown as string);
    }

    await SystemLog.create({
      action: 'COMMISSION_RUN_COMPLETE',
      details: `Successfully processed binary pairing for ${users.length} users.`,
      type: 'SUCCESS'
    });

    res.json({ message: 'Commission Run Completed', usersProcessed: users.length });
  } catch (error) {
    await SystemLog.create({
      action: 'COMMISSION_RUN_FAILED',
      details: (error as Error).message,
      type: 'ERROR'
    });
    res.status(500).json({ message: 'Commission Run Failed' });
  }
};

// User Management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = buildSort(req, 'enrollmentDate', -1);
    const search = buildSearch(req, ['username', 'email', 'firstName', 'lastName', 'role']);

    const query: any = { ...search };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort(sort as any)
      .skip(skip)
      .limit(limit);

    res.json({
      data: users, // Standardized to 'data' instead of 'users' for DataTable consistency
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    await SystemLog.create({
      action: 'USER_ROLE_UPDATE',
      details: `Updated role for ${user.username} to ${role}`,
      type: 'WARNING'
    });

    res.json({ message: `User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role' });
  }
};