import { describe, it, beforeEach, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { carService, managerService } from '../../../controllers/admin/manageCar';

vi.mock('../../../middlewares/authentication', () => ({
    authMiddleware: (req: any, res: any, next: any) => next(),
    protect: (req: any, res: any, next: any) => next(),
    isManager: (req: any, res: any, next: any) => next(),
    isAdmin: (req: any, res: any, next: any) => next(),
    isCustomer: (req: any, res: any, next: any) => next(),
}));

describe('Admin Manage Car', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    const validVin = 'VIN123';
    const validCarId = '6838ce9c0aeeaf4cbe5495c8';
    const validManagerId = '6838ce9c0aeeaf4cbe5495c8';

    describe('removeCar', () => {
        it('should return 400 if VIN is missing', async () => {
            const res = await request(app)
                .patch('/api/v1/admin/remove-car')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Car VIN is required!");
        });

        it('should return 404 if car not found', async () => {
            vi.spyOn(carService, 'findCar').mockResolvedValue(null);

            const res = await request(app)
                .patch('/api/v1/admin/remove-car')
                .send({ vin: validVin });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Car with specified VIN not found!");
        });

        it('should return 400 if no manager assigned to car', async () => {
            vi.spyOn(carService, 'findCar').mockResolvedValue({
            _id: 'mock-car-id',
            brand: 'Toyota',
            model: 'Corolla',
            price: 20000,
            isAvailable: true,
            units: [{ vin: 'VIN123', isAvailable: true }],
            assignedManager: null,
            category: 'mock-category-id',
        } as any);

            const res = await request(app)
                .patch('/api/v1/admin/remove-car')
                .send({ vin: validVin });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("No manager assigned to this car.");
        });

        it('should remove car from manager carsAssigned if last unit', async () => {
            const saveMock = vi.fn();
            const carMock = {
                _id: validCarId,
                units: [{ vin: validVin, isAvailable: true }],
                assignedManager: validManagerId,
                save: saveMock,
            };
            vi.spyOn(carService, 'findCar').mockResolvedValue({
                _id: validCarId,
                brand: 'Toyota',
                model: 'Corolla',
                price: 20000,
                isAvailable: true,
                units: [{ vin: 'VIN123', isAvailable: true }],
                assignedManager: validManagerId,
                category: 'mock-category-id',
                save: saveMock,
            } as any)
        
            const updateByIdSpy = vi.spyOn(managerService, 'updateById').mockResolvedValue({
                _id: validManagerId,
                hireDate: new Date(),
                yearsExperience: 5,
                qualifications: [],
                carsAssigned: [],
                name: 'Test Manager',
                email: 'manager@email.com',
                password: 'hashedPassword',
                role: 'Manager',
                isActive: true,
            } as any);

            const res = await request(app)
                .patch('/api/v1/admin/remove-car')
                .send({ vin: validVin });

            expect(updateByIdSpy).toHaveBeenCalledWith(validManagerId, { $pull: { carsAssigned: validCarId } });
            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Car unit removed successfully");
        });

        // it('should NOT remove car from manager carsAssigned if units remain', async () => {
        //     const saveMock = vi.fn();
        //     vi.spyOn(carService, 'findCar').mockResolvedValue({
        //         _id: validCarId,
        //         brand: 'Toyota',
        //         model: 'Corolla',
        //         price: 20000,
        //         isAvailable: true,
        //         units: [
        //             { vin: validVin, isAvailable: true },
        //             { vin: 'VIN123', isAvailable: true }
        //         ],
        //         assignedManager: validManagerId,
        //         category: 'mock-category-id',
        //     } as any)

        //     const updateByIdSpy = vi.spyOn(managerService, 'updateById').mockResolvedValue({
        //         _id: validManagerId,
        //         hireDate: new Date(),
        //         yearsExperience: 5,
        //         qualifications: [],
        //         carsAssigned: [validCarId],
        //         name: 'Test Manager',
        //         email: 'manager@email.com',
        //         password: 'hashedPassword',
        //         role: 'Manager',
        //         isActive: true,
        //     } as any)

        //     const res = await request(app)
        //         .patch('/api/v1/admin/remove-car')
        //         .send({ vin: validVin });

        //     expect(updateByIdSpy).not.toHaveBeenCalled();
        //     expect(saveMock).toHaveBeenCalled();
        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe("Car unit removed successfully");
        // });
    
    });
});