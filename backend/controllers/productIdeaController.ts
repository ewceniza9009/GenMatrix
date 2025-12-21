import { Request, Response } from 'express';
import ProductIdea from '../models/ProductIdea';
import Product from '../models/Product';
// import { v4 as uuidv4 } from 'uuid'; // Removed to avoid dependency

const generateSKU = () => {
    return 'PROD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Get all product ideas
 */
export const getAllIdeas = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const ideas = await ProductIdea.find(filter).sort({ createdAt: -1 });
        res.status(200).json(ideas);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product ideas', error });
    }
};

/**
 * Create a new product idea
 */
export const createIdea = async (req: Request, res: Response) => {
    try {
        const idea = new ProductIdea(req.body);
        const savedIdea = await idea.save();
        res.status(201).json(savedIdea);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product idea', error });
    }
};

/**
 * Update a product idea
 */
export const updateIdea = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedIdea = await ProductIdea.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedIdea) {
            return res.status(404).json({ message: 'Product Idea not found' });
        }
        res.status(200).json(updatedIdea);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product idea', error });
    }
};

/**
 * Delete a product idea
 */
export const deleteIdea = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ProductIdea.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product Idea deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product idea', error });
    }
};

/**
 * Promote an idea to a real Product
 */
export const promoteIdea = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idea = await ProductIdea.findById(id);

        if (!idea) {
            return res.status(404).json({ message: 'Product Idea not found' });
        }

        if (idea.status === 'converted') {
            return res.status(400).json({ message: 'This idea has already been converted to a product.' });
        }

        // Generate a SKU or use a placeholder
        const sku = generateSKU();

        // Create the Product
        const newProduct = new Product({
            name: idea.name,
            sku: sku,
            description: idea.description,
            price: idea.proposedPrice,
            retailPrice: (idea.proposedPrice * 1.2), // Default retail markup example
            pv: idea.targetPV,
            stock: 0, // Start with 0 stock
            image: idea.images && idea.images.length > 0 ? idea.images[0] : '', // Use first image
            category: 'New Release', // Default
            isActive: false, // Default to inactive so admin can review before going live
        });

        const savedProduct = await newProduct.save();

        // Update the Idea status
        idea.status = 'converted';
        idea.convertedProductId = savedProduct._id as any;
        await idea.save();

        res.status(200).json({
            message: 'Product Idea successfully promoted!',
            product: savedProduct,
            idea: idea
        });

    } catch (error: any) {
        console.error('Promote Error:', error);
        res.status(500).json({ message: 'Error promoting product idea', error: error.message });
    }
};
