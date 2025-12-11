import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    productId: Schema.Types.ObjectId;
    name: string;
    price: number;
    retailPrice?: number; // Snapshot of retail price at time of purchase
    pv: number;
    quantity: number;
    totalPrice: number;
    totalPV: number;
}

export interface IOrder extends Document {
    userId?: Schema.Types.ObjectId; // Optional for Guests
    referrerId?: Schema.Types.ObjectId; // Who gets the PV/Commission
    isGuest: boolean;
    guestDetails?: {
        name: string;
        email: string;
        address?: string;
    };
    items: IOrderItem[];
    totalAmount: number;
    totalPV: number;
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
    paymentMethod: 'WALLET' | 'CREDIT_CARD'; // For now, likely WALLET
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Not required for guests
    referrerId: { type: Schema.Types.ObjectId, ref: 'User' },
    isGuest: { type: Boolean, default: false },
    guestDetails: {
        name: { type: String },
        email: { type: String },
        address: { type: String }
    },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        retailPrice: { type: Number },
        pv: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true },
        totalPV: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    totalPV: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentMethod: { type: String, default: 'WALLET' }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', orderSchema);
