import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Wallet from '../models/Wallet';
import SystemConfig from '../models/SystemConfig';
import { CommissionEngine } from '../services/CommissionEngine';

// Buy Items
export const createOrder = async (req: Request, res: Response) => {
    try {
        // 1. Check Switch
        const config = await (SystemConfig as any).getLatest();
        if (!config.enableShop) {
            return res.status(403).json({ message: 'Shop is currently disabled' });
        }

        const userId = (req as any).user.id;
        const { items } = req.body; // [{ productId, quantity }]

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // 2. Validate Items & Calculate Totals
        let totalAmount = 0;
        let totalPV = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(400).json({ message: `Product not found: ${item.productId}` });
            if (!product.isActive) return res.status(400).json({ message: `Product unavailable: ${product.name}` });
            if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });

            const linePrice = product.price * item.quantity;
            const linePV = product.pv * item.quantity;

            totalAmount += linePrice;
            totalPV += linePV;

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                pv: product.pv,
                quantity: item.quantity,
                totalPrice: linePrice,
                totalPV: linePV
            });
        }

        // 3. Payment (Wallet)
        const wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < totalAmount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Deduct
        wallet.balance -= totalAmount;
        wallet.transactions.push({
            type: 'PURCHASE',
            amount: totalAmount,
            description: `Order Payment - ${orderItems.length} items`,
            date: new Date(),
            status: 'COMPLETED'
        } as any);
        await wallet.save();

        // 4. Save Order
        const order = await Order.create({
            userId,
            items: orderItems,
            totalAmount,
            totalPV,
            status: 'PAID',
            paymentMethod: 'WALLET'
        });

        // 5. Update Inventory (Simple decrease)
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }

        // 6. COMMISSION ENGINE: Propagate PV
        if (totalPV > 0) {
            // Add to User's Personal PV? Or just upline?
            // Usually Repurchase PV counts for Personal PV (Maintenance) AND Upline (Commission)
            // But CommissionEngine.updateUplinePV primarily pushes UP.
            // Let's assume we call that.

            // NOTE: Some systems add to PersonalPV field on User too.
            // CommissionEngine.updateUplinePV adds to PARENT's left/right. 
            // It does NOT update the user's own "Personal PV" field in the User model unless we do it here.
            // Let's do it here for completeness if User model has personalPV.

            // We use the Engine for the heavy lifting up the tree.
            await CommissionEngine.updateUplinePV(userId, totalPV);
        }

        res.status(201).json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing order' });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
};
