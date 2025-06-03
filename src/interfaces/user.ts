import { Role } from './enums'

export interface IBaseUser {
    _id: string,
    name: string
    email: string
    password: string
    phoneNumber?: string
    address?: string
    role: Role,
    resetToken?: string;
    resetTokenExpires?: Date;
    createdAt?: Date
    updatedAt?: Date
}

export interface ICustomer extends IBaseUser {
    carsPurchased?: {
        car: string
        vin: string
        date: Date
        price: number
    }[]
}

export interface IManager extends IBaseUser {
    hireDate: Date
    yearsExperience: number
    qualifications: string[]
    carsAssigned: string[]
    isActive: boolean
}

export { Role }
