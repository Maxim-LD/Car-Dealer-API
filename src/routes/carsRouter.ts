import express from "express"
import { getAllCar } from "../controllers/car/cars"

const carRouter = express.Router()

// Any body can access this route - either logged in or not
carRouter.get('/', getAllCar)

export default carRouter