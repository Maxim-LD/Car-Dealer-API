import express from 'express'
import { signup } from '../controllers/customer/signup'
import { validateCarId, validateCustomer } from '../validations/auth'
import { isCustomer, protect } from '../middlewares/authentication'
import { completePurchase, getPurchasedCar, purchaseCar } from '../controllers/customer/cars'

const customerRouter = express.Router()

// Routes sign up
customerRouter.post('/signup', validateCustomer, signup)

// initiate payment
customerRouter.post('/initiate-payment/:carId', protect, isCustomer, validateCarId, purchaseCar)
customerRouter.get('/verify-payment', protect, isCustomer, completePurchase)

// get purchased car info
customerRouter.get('/car/:carId', protect, isCustomer, validateCarId, getPurchasedCar)

export default customerRouter