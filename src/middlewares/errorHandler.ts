import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: err.success,
            message: err.message
        })
    }

    // Handle JWT related errors
    if (err instanceof TokenExpiredError) {
        res.status(401).json({
            success: false,
            message: "Token has expired. Please log in again"
        })
        return 
    }

    if (err instanceof JsonWebTokenError) {
        res.status(401).json({
            success: false,
            message: "Invalid token. Please log in again"
        })
        return 
    }

    const errorLine = err.stack?.split('\n')[1]?.trim() || 'No stack trace available'

    // Detailed error info for debugging
    console.error(JSON.stringify({
        success: false,
        status: (err instanceof AppError ? err.statusCode : 500),
        message: err.message,
        method: req.method,
        path: req.originalUrl,
        errorLine,
        // timestamp: new Date().toISOString()
    }, null, 2))
    
    res.status(500).json({
        success: false,
        message: 'Internal Server Error!'
    })
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const asyncHandler = (fn: AsyncHandler) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
