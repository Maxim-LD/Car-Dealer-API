import express from 'express'
import { signup } from '../controllers/manager/signup'
import { validateCarId, validateCarUpdate, validateManager, validateManagerId } from '../validations/auth'
import { isManager, protect } from '../middlewares/authentication'
import { getAllCar, getCar, updateCar } from '../controllers/manager/cars'
import { updateProfile } from '../controllers/manager/profile'
import { getAllCategory } from '../controllers/admin/manageCategory'

const managerRouter = express.Router()

// Manager sign up
managerRouter.post('/signup', validateManager, signup)

// update profile
managerRouter.patch('/profile/:email', protect, isManager, updateProfile)

// get assigned car 
managerRouter.get('/car/:carId', protect, isManager, validateCarId, getCar)

// get all assigned cars
managerRouter.get('/cars', protect, isManager, validateManagerId, getAllCar)

// update assigned car status
managerRouter.patch('/update-car/:carId', protect, isManager, validateCarId, validateCarUpdate, updateCar)

// gets all categories
managerRouter.get('/category', protect, isManager, getAllCategory)

export default managerRouter
