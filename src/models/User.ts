import mongoose from "mongoose";
import { IBaseUser, ICustomer, IManager } from "../interfaces/user";
import { Role } from "../interfaces/enums";

const userSchema = new mongoose.Schema<IBaseUser>({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    address: { type: String },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.Customer
    },
    resetToken: { type: String },
    resetTokenExpires: { type: Date }
}, {
    timestamps: true, discriminatorKey: 'role'
})

const User = mongoose.model<IBaseUser>('User', userSchema)

const purchasedCarSchema = new mongoose.Schema({
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    vin: { type: String },
    date: { type: Date, default: Date.now },
    price: { type: Number, required: true }
}, { _id: false }) 

const customerSchema = new mongoose.Schema<ICustomer>({
  carsPurchased: [purchasedCarSchema]
})

const Customer = User.discriminator<ICustomer>('Customer', customerSchema)

// Manager discriminator
const managerSchema = new mongoose.Schema<IManager>({
    hireDate: { type: Date },
    yearsExperience: { type: Number },
    qualifications: [{ type: String }],
    carsAssigned: [{ type: mongoose.Schema.Types.ObjectId , ref: 'Car' }],
    isActive: { type: Boolean, default: false }
})

const Manager = User.discriminator<IManager>('Manager', managerSchema)

export {
    User,
    Customer,
    Manager
}