import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { customerService } from '../../../controllers/customer/signup';
import { Role } from '../../../interfaces/user';

describe('Customer signup', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    })

    it('should return 201 and user data on successful signup', async () => {
        vi.spyOn(customerService, 'findByEmail').mockResolvedValue(null);
        vi.spyOn(customerService, 'create').mockResolvedValue({
            _id: 'user-id-123',
            name: 'Test Name',
            email: 'customer@email.com',
            phoneNumber: '123456789',
            address: 'address',
            password: 'hashedPassword',
            role: Role.Customer
        } as any);

        const res = await request(app)
            .post('/api/v1/customer/signup')
            .send({
                name: 'Test Name',
                email: 'customer@email.com',
                password: 'Password123',
                confirmPassword: 'Password123',
                phoneNumber: '123456789',
                address: 'address',
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User account created successfully');
        expect(res.body.data.name).toBe('Test Name');
        expect(res.body.data.email).toBe('customer@email.com');
        expect(customerService.create).toHaveBeenCalled();
    });

    it('should return 409 if the user already exists', async () => {
        vi.spyOn(customerService, 'findByEmail').mockResolvedValue({
            _id: 'existing-user-id',
            name: 'Existing User',
            email: 'customer@email.com',
            phoneNumber: '123456789',
            address: 'address',
            password: 'hashedPassword',
            role: Role.Customer
        } as any);
        const createSpy = vi.spyOn(customerService, 'create');

        const res = await request(app)
            .post('/api/v1/customer/signup')
            .send({
                name: 'Test Name',
                email: 'customer@email.com',
                password: 'Password123',
                confirmPassword: 'Password123',
                phoneNumber: '123456789',
                address: 'address'
            });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(createSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when unmatched passwords is provided', async () => {
        const createSpy = vi.spyOn(customerService, 'create');

        const res = await request(app)
            .post('/api/v1/customer/signup')
            .send({
                name: 'Test User',
                email: 'testuser@email.com',
                password: 'Password123',
                confirmPassword: 'Password456',
                phoneNumber: '123456789',
                address: 'Test Address'
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(createSpy).not.toHaveBeenCalled();
    })
})