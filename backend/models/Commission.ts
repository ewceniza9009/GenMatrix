import mongoose, { Document, Schema } from 'mongoose';

export interface ICommissionHistory {
  type: 'BINARY_BONUS' | 'PAIRING_BONUS' | 'MATCHING_BONUS' | 'DIRECT_REFERRAL' | 'ROI' | 'RANK_ACHIEVEMENT' | 'CUSTOM';
  amount: number;
  date: Date;
  details?: string;
  relatedUserId?: mongoose.Types.ObjectId;
}

export interface ICommission extends Document {
  userId: mongoose.Types.ObjectId;
  leftLegPV: number;
  rightLegPV: number;
  carriedLeftPV: number;
  carriedRightPV: number;
  totalEarned: number;
  lastCalculationDate?: Date;
  cyclePointThreshold: number;
  history: ICommissionHistory[];
}

const commissionSchema = new Schema<ICommission>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, unique: true },
  leftLegPV: { type: Number, default: 0 },
  rightLegPV: { type: Number, default: 0 },
  carriedLeftPV: { type: Number, default: 0 },
  carriedRightPV: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  lastCalculationDate: { type: Date },
  
  // Configuration snapshots
  cyclePointThreshold: { type: Number, default: 100 }, 
  
  history: [{
    type: { 
      type: String, 
      enum: ['BINARY_BONUS', 'PAIRING_BONUS', 'MATCHING_BONUS', 'DIRECT_REFERRAL', 'ROI', 'RANK_ACHIEVEMENT', 'CUSTOM'] 
    },
    amount: { type: Number },
    date: { type: Date, default: Date.now },
    details: { type: String },
    relatedUserId: { type: Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

export default mongoose.model<ICommission>('Commission', commissionSchema);
