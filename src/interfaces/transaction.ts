import { ObjectId } from "mongoose"
import { Status } from "./enums"

export interface ITransaction {
    amount: number
    email: string
    reference: string,
    status: Status,
    metadata?: {
        user: ObjectId
        car: ObjectId
    }
}