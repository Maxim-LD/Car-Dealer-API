import { describe, it, beforeEach, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import * as manageCategory from '../../../controllers/admin/manageCategory';
import type { Request, Response, NextFunction } from 'express';

interface MockedAuthModule {
    authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
}

vi.mock('../../../middlewares/authentication', () => ({
    authMiddleware: (req: Request, res: Response, next: NextFunction) => next(),
    protect: (req: Request, res: Response, next: NextFunction) => next(),
    isManager: (req: Request, res: Response, next: NextFunction) => next(),
    isAdmin: (req: Request, res: Response, next: NextFunction) => next(),
    isCustomer: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('Admin Create Category', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should create a new category successfully', async () => {
        vi.spyOn(manageCategory.categoryService, 'findCategory').mockResolvedValue(null);
        vi.spyOn(manageCategory.categoryService, 'create').mockResolvedValue({
            _id: 'mock-category-id',
            name: 'SUV',
            description: 'Sport Utility Vehicle',
            order: 1,
            slug: 'suv',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const res = await request(app)
            .post('/api/v1/admin/category/new')
            .send({
                name: 'SUV',
                description: 'Sport Utility Vehicle',
                order: 1
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('New category added successfully');
    });

    it('should return 409 if category already exists', async () => {
        vi.spyOn(manageCategory.categoryService, 'findCategory').mockResolvedValue({
            _id: 'mock-category-id',
            name: 'SUV',
            description: 'Sport Utility Vehicle',
            order: 1,
            slug: 'suv',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const res = await request(app)
            .post('/api/v1/admin/category/new')
            .send({
                name: 'SUV',
                description: 'Sport Utility Vehicle',
                order: 1
            });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Category already exist!');
    });

    it('should return 400 if name is missing', async () => {
        const res = await request(app)
            .post('/api/v1/admin/category/new')
            .send({
                description: 'Sport Utility Vehicle',
                order: 1
            });

        expect(res.status).toBe(400);
    });
});