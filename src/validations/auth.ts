import { Request, Response, NextFunction } from "express";
import Joi, { Schema } from "joi";
import mongoose from "mongoose";

const loginSchema = Joi.object({
    email: Joi.string().trim().lowercase().required().messages({ 
        "string.email": "Invalid email format!",
        "any.required": "Email is required!",
        "string.empty": "Email cannot be empty"    
    }),
    password: Joi.string().trim().min(8).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required().messages({
        "string.min": "Password must be atleast 8 characters",
        "any.required": "Password is required",
    })
})

const resetPasswordSchema = Joi.object({
    email: Joi.string().trim().lowercase().required().messages({
        "string.email": "Invalid email format!",
        "any.required": "Email is required!",
        "string.empty": "Email cannot be empty"    
    }),
    resetToken: Joi.string().trim().required().messages({
        "any.required": "Password is required",
    }),
    newPassword: Joi.string().trim().min(8).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required().messages({
        "string.min": "Password must be atleast 8 characters",
        "any.required": "Password is required",
    })
})

const customerSchema = Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().trim().lowercase().email().required().messages({
        "string.email": "Invalid email format!",
        "any.required": "Email is required!",
        "string.empty": "Email cannot be empty"
    }),
    password: Joi.string().trim().min(8).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required().messages({
        "string.min": "Password must be at least 8 characters",
        "string.empty": "Password cannot be empty",
        "any.required": "Password is required",
    }),
    confirmPassword: Joi.string().trim().valid(Joi.ref('password')).required().messages({
        'any.only': 'Password does not match!'
    }),
    phoneNumber: Joi.string().trim().allow(''),
    address: Joi.string().trim().allow('')
})

const managerSchema = Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().trim().lowercase().email().required().messages({
        "string.email": "Invalid email format!",
        "any.required": "Email is required!",
        "string.empty": "Email cannot be empty"
    }),
    password: Joi.string().trim().min(8).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required().messages({
        "string.min": "Password must be at least 8 characters",
        "string.empty": "Password cannot be empty",
        "any.required": "Password is required",
    }),
    confirmPassword: Joi.string().trim().valid(Joi.ref('password')).required(),
    phoneNumber: Joi.string().trim().required(),
    address: Joi.string().trim().required(),
    qualifications: Joi.string().trim().required(),
    yearsExperience: Joi.number().required()
})

const categorySchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    order: Joi.number().allow('')
})

const carSchema = Joi.object({
    brand: Joi.string().required(),
    model: Joi.string().required(),
    price: Joi.number().allow(''),
    category: Joi.string().required()
})
const vinSchema = Joi.object({
    vin: Joi.string().required(),
})

const objectIdSchema = (label = "iD") => 
    Joi.string()
        .required()
        .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("objectId.invalid")
            }
            return value
        })
        .messages({
            "objectId.invalid": `Invalid ${label} format! Must be a valid MongoDB ObjectId.`,
            "any.required": `${label} is required!`
        })

const paramsSchema = Joi.object({
    managerId: objectIdSchema("managerId").optional(),
    userId: objectIdSchema("userId").optional(),
    carId: objectIdSchema("carId").optional(),
})

const validator = (bodySchema: Schema | null, paramsShema: Schema | null) => (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate req body if body schema is only provided
        if (bodySchema) {
            const bodyResult = bodySchema.validate(req.body, { abortEarly: false }) 
            if (bodyResult.error) {
                res.status(400).json({
                    success: false,
                    message: 'Body validation error!',
                    error: bodyResult.error.details.map((error) => error.message)
                })
                return
            }
            req.body = bodyResult.value
        }

        // Validate req params if params schema is only provided
        if (paramsShema&& Object.keys(req.params).length > 0) {
            const paramsResult = paramsSchema.validate(req.params, { abortEarly: false })
            if (paramsResult.error) {
                res.status(400).json({
                    success: false,
                    message: "Params validation error!",
                    error: paramsResult.error.details.map((error) => error.message)
                })
                return
            }
            req.params = paramsResult.value 
        }
        
        next ()
    } catch (error) {
        let message = 'Something went wrong!'
        if (
            typeof error === 'object' &&
            error !== null && 
            'message' in error &&
            typeof (error as { message: string} )
        )
        res.status(500).json({
            success: false,
            message,
            data: error
        })
    }
}
const validateCustomer = validator(customerSchema, null)
const validateManager = validator(managerSchema, null)
const validateUserId = validator(null, paramsSchema)
const validateLogin = validator(loginSchema, null)
const validateCar = validator(carSchema, null)
const validateCarId = validator(null, paramsSchema)
const validateManagerId = validator(null, paramsSchema)
const validateCategory = validator(categorySchema, null)
const validateCarUpdate = validator(vinSchema, paramsSchema)
const validatePasswordReset = validator(resetPasswordSchema, null)

export {
    validateCustomer,
    validateManager,
    validateUserId,
    validateLogin,
    validateCar,
    validateCarId,
    validateCategory,
    validateManagerId,
    validateCarUpdate,
    validatePasswordReset
}