import { asyncHandler } from "../../middlewares/errorHandler";
import Car from "../../models/Car";
import CarService from "../../services/CarService";
import pagination from "../../utils/pagination";

export const carService = new CarService(Car)

export const getAllCar = asyncHandler(async (req, res) => {
    const { pageNumber, pageSize } = pagination(req)

    // this helps to to safely get a string from query param
    const getString = (value: unknown): string | undefined => {
        if (Array.isArray(value)) return String(value[0])
        if (typeof value === "string") return value
        return undefined
    }

    const filters = {
        brand: getString(req.query.brand),
        model: getString(req.query.model),
        minPrice: req.query.minPrice ? parseFloat(getString(req.query.minPrice) || '') : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(getString(req.query.maxPrice) || '') : undefined,
        // isAvailable: req.query.isAvailable !== undefined ? getString(req.query.isAvailable) === 'true' : undefined
    }

    const { cars, totalUnitsCount, totalCount } = await carService.getAllCar( filters, pageNumber, pageSize)
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
            totalCount: totalUnitsCount,
            cars
        },
        pagination: {
            totalPages,
            currentPage: pageNumber,
            pageSize
        }
    })
})


