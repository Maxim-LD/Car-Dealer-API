import { describe, it, beforeEach, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { carService } from '../../../controllers/car/cars';

describe('GET /api/v1/cars', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return 200 and cars data when cars are found', async () => {
        vi.spyOn(carService, 'getAllCar').mockResolvedValue({
            cars: [
                { _id: 'car1', brand: 'Toyota', model: 'Corolla', price: 10000 },
                { _id: 'car2', brand: 'Honda', model: 'Civic', price: 12000 }
            ],
            totalUnitsCount: 2,
            totalCount: 2
        });

        const res = await request(app)
            .get('/api/v1/cars')
            .query({ brand: 'Toyota', pageNumber: 1, pageSize: 5 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Cars fetched successfully');
        expect(res.body.data.cars).toHaveLength(2);
        expect(res.body.data.totalCount).toBe(2);
        expect(res.body.pagination).toHaveProperty('totalPages');
        expect(res.body.pagination).toHaveProperty('currentPage', 1);
        expect(res.body.pagination).toHaveProperty('pageSize', 5);
    });

    it('should return 404 if no cars are found', async () => {
        vi.spyOn(carService, 'getAllCar').mockResolvedValue({
            cars: [],
            totalUnitsCount: 0,
            totalCount: 0
        });

        const res = await request(app)
            .get('/api/v1/cars')
            .query({ brand: 'NonExistentBrand', pageNumber: 1, pageSize: 5 });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('No cars found!');
    });
});