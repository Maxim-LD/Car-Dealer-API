import { Model } from "mongoose";
import { ICategory } from "../interfaces/category";

class CategoryService {
    private categoryModel: Model<ICategory> 

    constructor(categoryModel: Model<ICategory>) {
        this.categoryModel = categoryModel
    }

    async create(data: object): Promise<ICategory> {
        const category = new this.categoryModel(data)
        return await category.save()
    }

    async update(categoryId: string, updateData: object): Promise<ICategory | null> {
        return this.categoryModel.findByIdAndUpdate(
            { _id: categoryId },
            updateData,
            { new: true, runValidators: true}
        )
    }

    async findCategory(data: Partial<ICategory>): Promise<ICategory | null> {
        return this.categoryModel.findOne(data)
    }

    async getAll(pageNumber: number, pageSize: number): Promise<{ categories: ICategory[], totalCount: number }> {
        const skip = (pageNumber - 1) * pageSize;

        const [categories, totalCount] = await Promise.all([
            this.categoryModel.find()
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 })
                .select('name description order')
                .lean(),
            this.categoryModel.countDocuments()
        ]);

        return { categories, totalCount };
    }

    async delete(categoryId: string): Promise<null> {
        return this.categoryModel.findByIdAndDelete({ _id: categoryId })
    }
}

export default CategoryService