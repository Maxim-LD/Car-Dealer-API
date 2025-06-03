import mongoose from "mongoose";
import { ICategory } from "../interfaces/category";

const categorySchema = new mongoose.Schema <ICategory> ({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    slug: { type: String }
}, {
    timestamps: true
})

const Category = mongoose.model<ICategory>('Category', categorySchema)

export default Category 