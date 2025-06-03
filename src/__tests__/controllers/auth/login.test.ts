import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import * as password from '../../../utils/password';
import { userService } from '../../../controllers/auth/auth';
import { Role } from '../../../interfaces/user';


describe('User login', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // return successful login
    it('should return 200 with access token, role and successful login', async () => {
        vi.spyOn(userService, 'findByEmail').mockResolvedValue({
            _id: 'mock-user-id',
            name: 'Test User',
            email: 'customer@email.com',
            password: 'hashedPassword',
            role: Role.Customer,
        } as any);
        vi.spyOn(password, 'comparePassword').mockResolvedValue(true);

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'customer@email.com',
                password: 'Password123'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Logged in successfully');
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data).toHaveProperty('role');
    });

    // to check if user exist
    it('should return 404 if the user does not exist', async () => {
        vi.spyOn(userService, 'findByEmail').mockResolvedValue(null);
        vi.spyOn(password, 'comparePassword').mockResolvedValue(true);

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'customer@email.com',
                password: 'Password123'
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User account dose not exist!');
    });

    // to verify password
    it('should return 401 if wrong password is provided', async () => {
        vi.spyOn(userService, 'findByEmail').mockResolvedValue({
            _id: 'mock-user-id',
            name: 'Test User',
            email: 'customer@email.com',
            password: 'hashedPassword',
            role: Role.Customer,
        } as any);
        vi.spyOn(password, 'comparePassword').mockResolvedValue(false);

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'customer@email.com',
                password: 'Password123'
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid credentials!');
    });
});
