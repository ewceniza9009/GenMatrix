import { Request, Response } from 'express';
import Product from '../models/Product';
import SystemConfig from '../models/SystemConfig';

// Check if Shop is Enabled
export const getShopStatus = async (req: Request, res: Response) => {
    try {
        const config = await (SystemConfig as any).getLatest();
        res.json({ enableShop: config.enableShop });
    } catch (error) {
        res.status(500).json({ message: 'Error checking shop status' });
    }
};

// Get Active Products
export const getShopProducts = async (req: Request, res: Response) => {
    try {
        // Validation: Check if Shop is Enabled
        const config = await (SystemConfig as any).getLatest();
        if (!config.enableShop) {
            return res.status(403).json({ message: 'Shop is strictly disabled' });
        }

        const products = await Product.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// Admin: Get All Products
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// Admin: Create Product
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, sku, price, pv, description, stock, image, category } = req.body;

        const existing = await Product.findOne({ sku });
        if (existing) return res.status(400).json({ message: 'SKU already exists' });

        const product = await Product.create({
            name, sku, price, pv, description, stock, image, category, isActive: true
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product' });
    }
};

// Admin: Update Product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
};

// Admin: Delete/Archive
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};
