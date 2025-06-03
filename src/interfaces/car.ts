import { Types, ObjectId } from "mongoose";

export interface ICarUnit {
    vin: string
    isAvailable: boolean
}

export interface ICar {
    _id: ObjectId | string,
    brand: string,
    model: string,
    price: number,
    units: ICarUnit[],
    assignedManager?: Types.ObjectId | string | null,
    isAvailable: boolean,
    category: ObjectId,
    createdAt: Date
    updatedAt: Date
}