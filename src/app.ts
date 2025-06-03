import express, { Request, Response } from 'express'
import { errorHandler } from './middlewares/errorHandler'
import dbConnect from './config/db'
import customerRouter from './routes/customerRouter'
import authRouter from './routes/authRouter'
import managerRouter from './routes/managerRouter'
import adminRouter from './routes/adminRouter'
import carRouter from './routes/carsRouter'
import mongoSanitize from 'express-mongo-sanitize'

// an express app instance
const app = express()

// express middlewares setup 
app.use(express.json())

dbConnect()

// use routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/customer', customerRouter)
app.use('/api/v1/manager', managerRouter)
app.use('/api/v1/cars', carRouter)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Welcome to Car Dealer API!'
    })
})

app.use((req, res) => {
    res.status(404).json({
        message: `The endpoint "${req.originalUrl}" does not exist!`
    })
})

app.use(errorHandler)

export default app