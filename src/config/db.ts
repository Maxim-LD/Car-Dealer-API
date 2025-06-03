import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const dbConnect = async (): Promise<void> => {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/car_dealer_db'
    if (!dbUrl) {
        console.error('MongoDB connection error: DATABASE_URL is not set')
        return
    }
    try {
        await mongoose.connect(dbUrl)
        console.info('MongoDB connected successfully')
    } catch (error) {
        if (error instanceof Error) {
            console.error('MongoDB connection error:', error.message)
        } else {
            console.error('MongoDB connection error:', error)
        }
    }
}

export default dbConnect