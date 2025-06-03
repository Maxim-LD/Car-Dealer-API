import "express"
import { IUser } from "../../interfaces/user";

// This tells TypeScript that req.user is a valid property
declare module "express-serve-static-core" {
    interface Request {
        user?: {
            _id: string,
            role: string
        };
    }
}
