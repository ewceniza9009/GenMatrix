import mongoose, { Document, Schema } from 'mongoose';

export interface IProductIdea extends Document {
    name: string;
    description?: string;
    proposedPrice: number;
    targetPV: number;
    status: 'draft' | 'review' | 'approved' | 'converted' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    notes?: string;
    features?: string[];
    images?: string[];
    createdBy?: string;
    convertedProductId?: string; // Link to actual product if converted
}

const productIdeaSchema = new Schema<IProductIdea>({
    name: { type: String, required: true },
    description: { type: String },
    proposedPrice: { type: Number, default: 0 },
    targetPV: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['draft', 'review', 'approved', 'converted', 'rejected'],
        default: 'draft'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    notes: { type: String },
    features: [{ type: String }],
    images: [{ type: String }],
    createdBy: { type: String }, // User ID of creator (admin)
    convertedProductId: { type: Schema.Types.ObjectId, ref: 'Product' }
}, { timestamps: true });

export default mongoose.model<IProductIdea>('ProductIdea', productIdeaSchema);
