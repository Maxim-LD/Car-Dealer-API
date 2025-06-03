import Category from "../../models/Category";
import { generateSlug } from "../../utils/generateUtils";
import CategoryService from "../../services/CategoryService";
import { asyncHandler } from "../../middlewares/errorHandler";
import pagination from "../../utils/pagination";

export const categoryService = new CategoryService(Category)

export const createCategory = asyncHandler(async (req, res) => {
    const { name, description, order } = req.body

    const newCcategoryData = {
        name,
        description,
        order
    }

    const existingCategory = await categoryService.findCategory({
        name: newCcategoryData.name,
        description: newCcategoryData.description
    })

    if (existingCategory) {
        res.status(409).json({
            success: false,
            message: 'Category already exist!'
        })
        return
    }

    await categoryService.create({
        name,
        description,
        order,
        slug: generateSlug(name)
    })

    res.status(201).json({
        success: true,
        message: 'New category added successfully',
    })
})

export const updateCategory = asyncHandler(async (req, res) => {

})

export const getAllCategory = asyncHandler(async (req, res) => {
    const { pageNumber, pageSize } = pagination(req)

    const { categories, totalCount } = await categoryService.getAll(pageNumber, pageSize)
    const totalPages = Math.ceil(totalCount / pageSize)

    if (!categories || categories.length === 0) {
        res.status(404).json({
            success: false,
            message: "No categories found!"
        })
        return
    }

    res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: {
            totalCount,
            categories
        },
        pagination: {
            totalPages,
            currentPage: pageNumber,
            pageSize
        }
    });
})

export const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params

    if (!categoryId) {
        res.status(400).json({
            success: false,
            message: "Category ID is required!"
        })
        return
    }

    const deleted = await categoryService.delete(categoryId)

    if (!deleted) {
        res.status(404).json({
            success: false,
            message: "Category not found!"
        })
        return
    }

    res.status(200).json({
        success: true,
        message: "Category deleted successfully"
    })
})


