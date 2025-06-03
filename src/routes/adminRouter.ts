import express from 'express'
import { getCar, addCar, removeCar } from '../controllers/admin/manageCar'
import { isAdmin, protect } from '../middlewares/authentication'
import { createCategory, getAllCategory } from '../controllers/admin/manageCategory'
import { approveManager, assignCarToManager, getUser, getUsers } from '../controllers/admin/manageUser'
import { validateCar, validateCarId, validateCategory, validateManagerId, validateUserId } from '../validations/auth'

const adminRouter = express.Router()

// User-related routes
adminRouter.get('/user/:userId', protect, isAdmin, validateUserId, getUser)
adminRouter.get('/users/', protect, isAdmin, getUsers)

// Car-related routes
adminRouter.post('/car/new', protect, isAdmin, validateCar, addCar)
adminRouter.get('/car/:carId', protect, getCar)
adminRouter.patch('/remove-car/', protect, isAdmin, removeCar)

// Manager-related routes
adminRouter.patch('/approve-manager/:managerId', protect, isAdmin, validateManagerId, approveManager)
adminRouter.patch('/assign-car/:carId', protect, isAdmin, validateCarId, assignCarToManager)

// Category-related routes
adminRouter.post('/category/new', protect, isAdmin, validateCategory, createCategory)
adminRouter.get('/category', protect, isAdmin, getAllCategory)

export default adminRouter
