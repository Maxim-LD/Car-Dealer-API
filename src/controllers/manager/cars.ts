import mongoose from "mongoose";
import { asyncHandler } from "../../middlewares/errorHandler";
import Car from "../../models/Car";
import CarService from "../../services/CarService";
import pagination from "../../utils/pagination";

const carService = new CarService(Car)

export const getCar = asyncHandler(async (req, res) => {
    const managerId = req.user?._id
    const { carId } = req.params

    // check if the car exist and is assigned to the manager
    const exists = await carService.getCarById(carId)
    if (!exists) {
        res.status(404).json({
            success: false,
            message: 'Car not found!'
        })
        return
    }

    const carData = {
        carId,
        managerId
    }

    const assignedCar = await carService.findCar({
        _id: carData.carId,
        assignedManager: carData.managerId
    })

    
    if (!assignedCar) {
        res.status(403).json({
            success: false,
            message: 'You are not authorized to view this car.'
        })
        return
    }

    const { brand, price, model, units } = assignedCar

    // Success
    res.status(200).json({
        success: true,
        message: 'Car retrieved successfully',
        data: {
            brand,
            price,
            model,
            units
        }
    })


})

export const getAllCar = asyncHandler(async (req, res) => {
    const managerId = req.user!._id

    const { pageNumber, pageSize } = pagination(req)

    const filters = { isAvailable: req.query.isAvailable !== undefined ? req.query.isAvailable === 'true' : undefined }

    const { cars, totalUnitsCount, totalCount } = await carService.getCarsByManager(filters, managerId, pageNumber, pageSize)
    const totalPages = Math.ceil(totalCount / pageSize)

    if (!cars || cars.length === 0) {
        res.status(404).json({
            success: false,
            message: "No cars found!"
        })
        return
    }

     res.status(200).json({
            success: true,
            message: 'Cars fetched successfully',
            data: {
                totalCars: totalUnitsCount,
                cars
            },
            pagination: {
                totalPages,
                currentPage: pageNumber,
                pageSize
            }
        })
})

export const getCategory = asyncHandler(async (req, res) => {

})

export const updateCar = asyncHandler(async (req, res) => {
    const managerId = req.user!._id
    const { carId } = req.params
    const { vin } = req.body

    // Check if the car exists and is assigned to this manager
    const car = await carService.findCar({ _id: carId, assignedManager: managerId });
    if (!car) {
        res.status(403).json({
            success: false,
            message: "You are not authorized to update this car."
        })
        return
    }

    // Find the unit by VIN and update its availability
    const unit = car.units.find((u: any) => u.vin === vin);
    if (!unit) {
        res.status(404).json({
            success: false,
            message: "Car unit (VIN) not found."
        })
        return
    }

    // update availability
    unit.isAvailable = false
    await car.save()

    res.status(200).json({
        success: true,
        message: "Car unit marked as sold (unavailable)",
        data: {
            brand: car.brand,
            model: car.model,
            vin: unit.vin,
            isAvailable: unit.isAvailable
        }
    });
});