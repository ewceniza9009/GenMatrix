import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    sku: string;
    description?: string;
    price: number; // Member Price
    retailPrice: number; // Guest/Retail Price
    pv: number;
    stock: number;
    image?: string;
    isActive: boolean;
    category?: string;
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    retailPrice: { type: Number, required: true, min: 0, default: 0 },
    pv: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0 },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    category: { type: String }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', productSchema);
