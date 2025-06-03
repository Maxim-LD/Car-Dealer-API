import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/token";
import { asyncHandler } from "./errorHandler";
import { Role } from "../interfaces/enums";

// This protect all token required routes -- AUTHENTICATION
export const protect = asyncHandler(async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access denied. No token provided!'
        })
        return
    }
    
    const decodedToken = verifyToken(token)
    
    req.user = { _id: decodedToken.id, role: decodedToken.role }

    next()
})

// AUTHORIZATION
// Middleware for Admin access
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === Role.Admin) {
        return next()
    }
    res.status(403).json({
        success: false,
        message: 'Access denied!. Admin only'
    })
    return
}

// Middleware for manager access (includes Admin)
export const isManager = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === Role.Manager || req.user?.role === Role.Admin) {
        return next()
    } 
    res.status(403).json({
        success: false,
        message: 'Access denied!. Manager only'
    })
    return
}

// Middleware for customer access (includes Admin)
export const isCustomer = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === Role.Customer || req.user?.role === Role.Admin) {
        return next()
    } 
    res.status(403).json({
        success: false,
        message: 'Access denied!. Customer only'
    })
    return
}

