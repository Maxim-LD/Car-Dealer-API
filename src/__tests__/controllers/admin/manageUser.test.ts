import { describe, it, beforeEach, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { userService, managerService, carService } from '../../../controllers/admin/manageUser';
import { Role } from '../../../interfaces/enums';
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

describe('Admin Manage User', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    const validId = '6838ce9c0aeeaf4cbe5495c8'

    describe('getUser', () => {
        it('should return 404 if user not found', async () => {
            vi.spyOn(userService, 'findById').mockResolvedValue(null);

            const res = await request(app)
                .get(`/api/v1/admin/user/${validId}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User not found!');
        });

        it('should return 200 and user data if found', async () => {
            vi.spyOn(userService, 'findById').mockResolvedValue({
            _id: 'mock-user-id',
            name: 'Test User',
            email: 'customer@email.com',
            password: 'hashedPassword',
            role: Role.Customer,
        } as any);

            const res = await request(app)
                .get(`/api/v1/admin/user/${validId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Test User');
        });
    });

    describe('approveManager', () => {
        it('should return 404 if manager not found', async () => {
            vi.spyOn(managerService, 'findById').mockResolvedValue(null);

            const res = await request(app)
                .patch(`/api/v1/admin/approve-manager/${validId}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User not found!');
        });

        it('should return 400 if user is admin', async () => {
            vi.spyOn(managerService, 'findById').mockResolvedValue({
            _id: 'mock-user-id',
            name: 'Test User',
            email: 'customer@email.com',
            password: 'hashedPassword',
            role: Role.Admin,
        } as any);

            const res = await request(app)
                .patch(`/api/v1/admin/approve-manager/${validId}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Only eligible users can be approved as manager');
        });

        it('should return 403 if user has no qualifications', async () => {
            vi.spyOn(managerService, 'findById').mockResolvedValue({
            email: 'test@email.com',
            phoneNumber: '1234567890',
            address: '123 Main St',
            qualifications: [],
            hireDate: new Date().toISOString(),
            yearsExperience: 5,
            carsAssigned: [],
            isActive: true,
            name: 'Test Manager',
            _id: 'manager-id-123',
            password: 'hashedPassword',
            role: Role.Manager
        } as any);

            const res = await request(app)
                .patch(`/api/v1/admin/approve-manager/${validId}`);

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Users with qualifications can only be approved!');
        });

        it('should return 409 if already approved', async () => {
            vi.spyOn(managerService, 'findById').mockResolvedValue({
            email: 'test@email.com',
            phoneNumber: '1234567890',
            address: '123 Main St',
            qualifications: ['BSc Management'],
            hireDate: new Date().toISOString(),
            yearsExperience: 5,
            carsAssigned: [],
            isActive: true,
            name: 'Manager Name',
            _id: 'manager-id-123',
            password: 'hashedPassword',
            role: Role.Manager
        } as any);

            const res = await request(app)
                .patch(`/api/v1/admin/approve-manager/${validId}`);

            expect(res.status).toBe(409);
            expect(res.body.message).toMatch(/User already approved as manager/);
        });

        it('should approve manager successfully', async () => {
            vi.spyOn(managerService, 'findById').mockResolvedValue({
            email: 'test@email.com',
            phoneNumber: '1234567890',
            address: '123 Main St',
            qualifications: ['BSc Management'],
            hireDate: new Date().toISOString(),
            yearsExperience: 5,
            carsAssigned: [],
            isActive: false,
            name: 'Test Manager',
            _id: 'manager-id-123',
            password: 'hashedPassword',
                role: Role.Customer
        } as any)

            const res = await request(app)
                .patch(`/api/v1/admin/approve-manager/${validId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/approved as manager successfully/);
        });
    });

    describe('assignCarToManager', () => {
        it('should return 400 if email is missing', async () => {
            const res = await request(app)
                .patch(`/api/v1/admin/assign-car/${validId}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email is required!');
        });

        it('should return 403 if not an active manager', async () => {
            vi.spyOn(managerService, 'findByEmail').mockResolvedValue({
            email: 'test@email.com',
            phoneNumber: '1234567890',
            address: '123 Main St',
            qualifications: ['BSc Management'],
            hireDate: new Date().toISOString(),
            yearsExperience: 5,
            carsAssigned: [],
            isActive: false,
            name: 'Test Manager',
            _id: 'manager-id-123',
            password: 'hashedPassword',
            role: 'Manager'
        } as any);
            
            const res = await request(app)
                .patch(`/api/v1/admin/assign-car/${validId}`)
                .send({ email: 'manager@email.com' });

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Only active managers can be assigned cars!');
        });

        it('should return 400 if car not available or already assigned', async () => {
            vi.spyOn(managerService, 'findByEmail').mockResolvedValue({
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
            vi.spyOn(carService, 'getAvailableCar').mockResolvedValue(null);

            const res = await request(app)
                .patch(`/api/v1/admin/assign-car/${validId}`)
                .send({ email: 'manager@email.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Car already assigned or not available!');
        });

        it('should assign car to manager successfully', async () => {
            vi.spyOn(managerService, 'findByEmail').mockResolvedValue({
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
        
            vi.spyOn(carService, 'getAvailableCar').mockResolvedValue({
             _id: 'mock-car-id',
            brand: "string",
            model: 'string',
            price: 1000,
            units: [],
            assignedManager: 'string',
            isAvailable: true,
            category: 'mock-category-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as any);
        
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
            vi.spyOn(carService, 'updateCar').mockResolvedValue({
             _id: 'mock-car-id',
            brand: "string",
            model: 'string',
            price: 1000,
            units: [],
            assignedManager: 'string',
            isAvailable: true,
            category: 'mock-category-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as any);

            const res = await request(app)
                .patch(`/api/v1/admin/assign-car/${validId}`)
                .send({ email: 'manager@email.com' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Car assigned to manager successfully');
        });
    });
});