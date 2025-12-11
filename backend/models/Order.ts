import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    productId: Schema.Types.ObjectId;
    name: string;
    price: number;
    pv: number;
    quantity: number;
    totalPrice: number;
    totalPV: number;
}

export interface IOrder extends Document {
    userId: Schema.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    totalPV: number;
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
    paymentMethod: 'WALLET' | 'CREDIT_CARD'; // For now, likely WALLET
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
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
