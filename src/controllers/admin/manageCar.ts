import Car from "../../models/Car";
import CarService from "../../services/CarService";
import { generateVIN } from "../../utils/generateUtils";
import { asyncHandler } from "../../middlewares/errorHandler";
import CategoryService from "../../services/CategoryService";
import Category from "../../models/Category";
import ManagerService from "../../services/ManagerService";
import { Manager } from "../../models/User";

export const carService = new CarService(Car)
export const categoryService = new CategoryService(Category)
export const managerService = new ManagerService(Manager)

export const addCar = asyncHandler(async (req, res) => {
    const { brand, model, price, category } = req.body

    const categoryData = await categoryService.findCategory({ slug: category })
        if (!categoryData) {
            res.status(404).json({
                success: false,
                message: 'Category not found!'
            })
            return
        }

    const vin = generateVIN()

    const newCarData = {
        brand,
        model,
        price,
        units: [{ vin, isAvailable: true }],
        category: categoryData._id
    }

    const existingCar = await carService.findCar({
        brand: newCarData.brand,
        model: newCarData.model,
    })

    if (existingCar) {
        existingCar.units.push({ vin, isAvailable: true })
        await existingCar.save()

        res.status(200).json({
            success: true,
            message: 'New car added successfully',
            data: {
                brand: existingCar.brand,
                model: existingCar.model,
                price: existingCar.price,
                units: existingCar.units.length
            }
        })
        return
    }

    const car = await carService.addCar(newCarData)

    res.status(201).json({
        success: true,
        message: 'New car added successfully',
        data: {
            brand: car.brand,
            model: car.model,
            price: car.price,
            units: car.units.length
        }
    })

})

export const getCar = asyncHandler(async (req, res) => {
    const { carId } = req.params
    
    const car = await carService.getCarById(carId)
        if (!car) {
            res.status(404).json({
                success: false,
                message: 'Car not found!'
            })
            return
        }

        res.status(200).json({
            success: true,
            message: 'Car fetched successfully',
            data: car
        })
})

export const removeCar = asyncHandler(async (req, res) =>  {
    const { vin } = req.body
    if (!vin) {
        res.status(400).json({
            success: false,
            message: "Car VIN is required!"
        })
        return
    }

    // Find the car containing the unit with the given VIN
    const car = await carService.findCar({ "units.vin": vin } as any)
    if (!car) {
        res.status(404).json({
            success: false,
            message: "Car with specified VIN not found!"
        })
        return
    }

    // Extract managerId before modifying car
    const managerId = car.assignedManager

    if (!managerId) {
        res.status(400).json({
            success: false,
            message: "No manager assigned to this car."
        })
        return
    }

    // Remove the unit with the given VIN from the car's units array
    car.units = car.units.filter((unit: any) => unit.vin !== vin)

    // If the car has no more units, remove assignedManager and update manager's carsAssigned
    if (car.units.length === 0 && car.assignedManager) {
        // Remove car from manager's carsAssigned
        await managerService.updateById(managerId, { $pull: { carsAssigned: car._id } })

        // Remove assignedManager from car
        car.assignedManager = null
    }

    await car.save()

    res.status(200).json({
        success: true,
        message: "Car unit removed successfully"
    })
})




