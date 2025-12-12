import { Request } from 'express';

export const getPaginationParams = (req: Request) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

export const buildSort = (req: Request, defaultSort: string = 'createdAt', defaultOrder: number = -1) => {
    const sortBy = (req.query.sortBy as string) || defaultSort;
    const order = req.query.order === 'asc' ? 1 : -1;
    return { [sortBy]: order };
};

export const buildSearch = (req: Request, fields: string[]) => {
    const search = req.query.search as string;
    if (!search) return {};

    const regex = { $regex: search, $options: 'i' };
    return {
        $or: fields.map(field => ({ [field]: regex }))
    };
};
