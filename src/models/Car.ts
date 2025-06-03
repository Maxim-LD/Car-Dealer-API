import mongoose from "mongoose";
import { ICar, ICarUnit } from "../interfaces/car";

const carUnitSchema = new mongoose.Schema<ICarUnit>(
    {
        isAvailable: { type: Boolean, default: true },
        vin: { type: String, required: true }
    }, {
        _id: false
    }
)

const carSchema = new mongoose.Schema<ICar>({
    brand: { type: String, required: true },
    model: { type: String, required: true },
    price: { type: Number, required: true },
    units: { type: [carUnitSchema], default: [] },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
}, {
    timestamps: true
})

const Car = mongoose.model<ICar>('Car', carSchema)

export default Car