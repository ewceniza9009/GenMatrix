import mongoose, { Document, Schema } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  price: number;
  pv: number;
  description?: string;
  features: string[];
  badge?: string;
  isActive: boolean;
  bonuses: {
    type: string;
    value: number;
  }[];
}

const packageSchema = new Schema<IPackage>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  pv: { type: Number, required: true },
  description: { type: String },
  features: [{ type: String }],
  badge: { type: String },
  isActive: { type: Boolean, default: true },
  bonuses: [{
    type: { type: String },
    value: { type: Number }
  }]
});

export default mongoose.model<IPackage>('Package', packageSchema);
