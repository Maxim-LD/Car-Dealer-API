import Car from "../../models/Car";
import { Role } from "../../interfaces/enums";
import pagination from "../../utils/pagination";
import { Manager, User } from "../../models/User";
import CarService from "../../services/CarService";
import UserService from "../../services/CustomerService";
import ManagerService from "../../services/ManagerService";
import { asyncHandler } from "../../middlewares/errorHandler";

export const userService = new UserService(User)
export const managerService = new ManagerService(Manager)
export const carService = new CarService(Car)

export const getUsers = asyncHandler(async (req, res) => {
    const { pageNumber, pageSize } = pagination(req)

    const { users, totalCount } = await userService.getAllUser(pageNumber, pageSize)
    const totalPages = Math.ceil(totalCount / pageSize)

    if (!users || users.length === 0) {
        res.status(404).json({
            success: false,
            message: "No users found!"
        })
        return
    }
    
    res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: {
            totalUsers: totalCount,
            users
        },
        pagination: {
            totalPages,
            currentPage: pageNumber,
            pageSize
        }
    })
})

export const assignCarToManager = asyncHandler(async (req, res) => {
    const { carId } = req.params

    const { email } = req.body
    if (!email) {
        res.status(400).json({
            success: false,
            message: 'Email is required!'
        })
        return
    }
    
    // check if user is a manager and is active
    const manager = await managerService.findByEmail(email)    
    if (manager?.role !== Role.Manager || !manager.isActive) {
            res.status(403).json({
            success: false,
            message: 'Only active managers can be assigned cars!'
        })
        return
    }

    // check for available units and not already assigned
    const availableCars = await carService.getAvailableCar(carId, manager._id)    
    if (!availableCars) {
        res.status(400).json({
            success: false,
            message: 'Car already assigned or not available!'
        })
        return
    }

    // assign car to a manager list
    await managerService.update(
        email, 
        { $addToSet: { carsAssigned: availableCars._id } }
    )

    // add manager to car record
    await carService.updateCar(
        availableCars._id.toString(),
        { assignedManager: manager._id }
    )
  
    res.status(200).json({
    success: true,
    message: 'Car assigned to manager successfully',
        data: {
            name: manager.name,
            carsAssigned: manager.carsAssigned,
            date: new Date(Date.now()).toLocaleString()
        }
    });
})

export const approveManager = asyncHandler(async (req, res) => {
    const { managerId } = req.params

    const exists = await managerService.findById(managerId)
    if (!exists) {
        res.status(404).json({
            success: false,
            message: 'User not found!'
        })
        return
    }

    // Only approve other users but not admin 
    if (exists.role === Role.Admin) {
        res.status(400).json({
            success: false,
            message: 'Only eligible users can be approved as manager'
        })
        return
    }

    if (!exists.qualifications || exists.qualifications.length === 0) {
        res.status(403).json({
            success: true,
            message: 'Users with qualifications can only be approved!'
        })
        return
    }

    if (exists.isActive === true) {
        res.status(409).json({
            success: false,
            message: `User already approved as manager on ${new Date(exists.hireDate).toLocaleDateString()}`
        })
        return
    }

    const updateData = {
        isActive: true,
        hireDate: new Date()
    }

    await managerService.update(exists.email, updateData)
    
    res.status(200).json({
        success: true,
        message: `${exists.name} approved as manager successfully`,
    })    
})

export const getUser = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const exists = await userService.findById(userId)
    if (!exists) {
        res.status(404).json({
            success: false,
            message: 'User not found!'
        })
        return
    }

    res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: {
            name: exists.name,
            email: exists.email,
            phoneNumber: exists.phoneNumber,
            role: exists.role
        }
    })
})

export const deleteUser = asyncHandler(async (req, res) =>  {

})