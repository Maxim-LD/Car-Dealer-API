import { describe, it, beforeEach, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { managerService } from '../../../controllers/manager/profile';
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

describe('Manager Profile Update', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // it('should return 400 if email is missing', async () => {
    //     const res = await request(app)
    //         .patch('/api/v1/manager/profile/') // No email param
    //         .send({ });

    //     expect(res.status).toBe(400);
    //     expect(res.body).toHaveProperty('message', 'Email is required!');
    // });

    it('should return 400 for invalid email format', async () => {
        const res = await request(app)
            .patch('/api/v1/manager/profile/invalid-email')
            .send({ phoneNumber: '1234567890' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid email format!');
    });

    it('should return 400 if no update data provided', async () => {
        const res = await request(app)
            .patch('/api/v1/manager/profile/test@email.com')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'No update data provided!');
    });

    it('should return 404 if manager not found', async () => {
        vi.spyOn(managerService, 'update').mockResolvedValue(null);

        const res = await request(app)
            .patch('/api/v1/manager/profile/test@email.com')
            .send({ phoneNumber: '1234567890' });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Manager not found!');
    });

    it('should update profile successfully', async () => {
        vi.spyOn(managerService, 'update').mockResolvedValue({
            email: 'test@email.com',
            phoneNumber: '1234567890',
            address: '123 Main St',
            qualifications: ['BSc Management'],
            hireDate: new Date().toISOString(),
            yearsExperience: 5,
            carsAssigned: [],
            isActive: true,
            name: 'Test Manager',
            _id: 'manager-id-123',
            password: 'hashedPassword',
            role: 'Manager'
        } as any);

        const res = await request(app)
            .patch('/api/v1/manager/profile/test@email.com')
            .send({ phoneNumber: '1234567890', address: '123 Main St', qualifications: ['BSc Management'] });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('email', 'test@email.com');
        expect(res.body.data).toHaveProperty('phoneNumber', '1234567890');
        expect(res.body.data).toHaveProperty('address', '123 Main St');
        expect(res.body.data).toHaveProperty('qualifications');
    });
});