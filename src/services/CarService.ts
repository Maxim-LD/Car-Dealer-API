import { Document, Model } from "mongoose";
import { ICar, ICarUnit } from "../interfaces/car";

class CarService {
    private carModel: Model<ICar>

    constructor(carModel: Model<ICar>) {
        this.carModel = carModel
    }

    // this handles new car addition
    async addCar(data: object): Promise<ICar & Document> {
        const car = new this.carModel(data)
        return car.save()
    }

    // finds car with specific data
    async findCar(data: Partial<ICar>): Promise<ICar & Document| null> {
        return this.carModel.findOne(data)
    }

    // get a car by id
    async getCarById(carId: string): Promise<ICar | null> {
        return this.carModel
            .findById({ _id: carId })
            .select('brand model price units -_id')
            .lean()
    }
    
    // gets all car
    async getAllCar(
        filters: { brand?: string; model?: string; minPrice?: number; maxPrice?: number; isAvailable?: boolean },
        pageNumber: number,
        pageSize: number
    ): Promise<{ cars: any[], totalUnitsCount: number, totalCount: number }> {

        const skip = (pageNumber - 1) * pageSize 

        // req query for filtering
        const query: any = {}

        if (filters.brand) query.brand = filters.brand
        if (filters.model) query.model = filters.model
        if (filters.isAvailable !== undefined) {
            query.units = { $elemMatch: { isAvailable: filters.isAvailable } };
        }
        if (filters.minPrice || filters.maxPrice) {
            query.price = {}
            if (filters.minPrice) query.price.$gte = filters.minPrice;
            if (filters.maxPrice) query.price.$lte = filters.maxPrice;
        }
        
        const [ cars, totalCount ] = await Promise.all([
            this.carModel
                .find(query)
                .select('brand model price units -_id')
                .populate('category', 'name description -_id')
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.carModel.countDocuments(query)
        ])

                
        let totalUnitsCount = 0;

        const enhancedCars = cars.map(car => {
            const unitsArray = Array.isArray(car.units) ? car.units : [];
            const unitCount = unitsArray.length || 0;
            const availableUnits = unitsArray.filter((u: any) => u.isAvailable).length;
            const unavailableUnits = unitCount - availableUnits;

            totalUnitsCount += unitCount > 0 ? unitCount : 1; // count at least 1 for cars with no units

            return {
                ...car,
                totalUnits: unitCount > 0 ? unitCount : 1,
                availableUnits,
                unavailableUnits
            }
        })

        return {
            cars: enhancedCars,
            totalUnitsCount,
            totalCount
        }
    }

    async getCarsByManager(
        filters: { isAvailable?: boolean },
        managerId: string,
        pageNumber: number,
        pageSize: number
    ): Promise<{ cars: ICar[], totalUnitsCount: number, totalCount: number}> {

        const skip = (pageNumber - 1) * pageSize

        const query: any = {}

        if (filters.isAvailable !== undefined) {
            query.units = { $elemMatch: { isAvailable: filters.isAvailable } }
        }

        const [ cars, totalCount ] = await Promise.all([
            this.carModel
                .find({ assignedManager: managerId })
                .select('brand model price units -_id')
                .skip(skip)
                .sort({ createdAt: -1})
                .limit(pageSize)
                .lean(),
            
            this.carModel.countDocuments({ assignedManager: managerId, query })
        ])

        let totalUnitsCount = 0

        const advancedFilter = cars.map(car => {
            const unitsArray = Array.isArray(car.units) ? car.units : []
            const unitCount = unitsArray.length || 0;
            
            totalUnitsCount += unitCount > 0 ? unitCount : 1; // count at least 1 for cars with no units

            return {
                ...car,
                totalUnits: unitCount > 0 ? unitCount : 1,
            }
        })
            
        return {
            cars: advancedFilter,
            totalUnitsCount,
            totalCount
        }
    }

    async updateCar(carId: string, updateData: any): Promise<ICar | null> {
        // Defensive: prevent category from being set to an array or invalid value
        if (
            Object.prototype.hasOwnProperty.call(updateData, 'category') &&
            (Array.isArray(updateData.category) ||
             (typeof updateData.category !== 'string' && typeof updateData.category !== 'object') ||
             (typeof updateData.category === 'string' && !updateData.category.match(/^[a-fA-F0-9]{24}$/))
            )
        ) {
            // Optionally log a warning here
            delete updateData.category;
        }
        return this.carModel.findByIdAndUpdate(
            { _id: carId },
            updateData,
            { new: true, runValidators: true })
    }

    async removeCar(carId: string): Promise<null> {
        return this.carModel.findByIdAndDelete({ _id: carId })
    }

    async getAvailableCar(carId: string, managerId?: string): Promise<ICar | null> {
        // check for an unassigned car with available units
        const query: any = {
            _id: carId,
            units: { $elemMatch: { isAvailable: true } }
        }

        // and has no assigned manager
        query.$or = [
            { assignedManager: { $exists: false } },
            { assignedManager: null }
        ]
        
        // check if the car is assigned to the manager prevent duplication -- optional
        if (managerId) [
            query.assignedManager = { $ne: managerId }
        ]

        return this.carModel.findOne(query)
    }

}

export default CarService