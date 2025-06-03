import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const dbConnect = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string)
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