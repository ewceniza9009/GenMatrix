import { Request, Response } from 'express';
import Package from '../models/Package';

// Get all packages (Public/Private)
// If admin query param ?all=true is passed, returns all including inactive
export const getAllPackages = async (req: Request, res: Response) => {
    try {
        const isAdmin = (req as any).user?.role === 'admin';
        const showAll = isAdmin && req.query.all === 'true';

        const query = showAll ? {} : { isActive: true };
        const packages = await Package.find(query).sort({ price: 1 }); // Sort by price usually makes sense

        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages' });
    }
};

// Create Package (Admin Only)
export const createPackage = async (req: Request, res: Response) => {
    try {
        const { name, price, pv, description, features, badge, isActive } = req.body;

        // Basic validation
        if (!name || price == null || pv == null) {
            return res.status(400).json({ message: 'Name, Price, and PV are required' });
        }

        const newPackage = await Package.create({
            name,
            price,
            pv,
            description,
            features: features || [],
            badge,
            isActive: isActive !== undefined ? isActive : true,
            bonuses: [] // Can be extended later
        });

        res.status(201).json(newPackage);
    } catch (error) {
        res.status(500).json({ message: 'Error creating package' });
    }
};

// Update Package (Admin Only)
export const updatePackage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const pkg = await Package.findByIdAndUpdate(id, updates, { new: true });

        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.json(pkg);
    } catch (error) {
        res.status(500).json({ message: 'Error updating package' });
    }
};

// Delete Package (Admin Only) - Soft Delete preferred usually, but we'll do hard delete if requested or toggle active
export const deletePackage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // We can do a hard delete
        const pkg = await Package.findByIdAndDelete(id);

        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting package' });
    }
};
