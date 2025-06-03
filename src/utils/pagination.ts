import { Request } from "express";

const pagination = (req: Request) => {
    // Extracts the page and size query parameters which can be string, array, ParsedQs, or undefined.
    const rawPage = req.query.page 
    const rawSize = req.query.size 

    const getString = (value: unknown, defaultValue: string) => {
        if (Array.isArray(value)) return String(value[0]) 
        if (typeof value === "string") return value 
        return defaultValue 
    } 

    const pageNumber = parseInt(getString(rawPage, "1"), 10) 
    const pageSize = parseInt(getString(rawSize, "5"), 10) 
    const skip = (pageNumber - 1) * pageSize 

    return { pageNumber, pageSize, skip }
} 

export default pagination