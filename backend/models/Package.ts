import mongoose, { Document, Schema } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  price: number;
  pv: number;
  description?: string;
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
  bonuses: [{
    type: { type: String }, 
    value: { type: Number }
  }]
});

export default mongoose.model<IPackage>('Package', packageSchema);
