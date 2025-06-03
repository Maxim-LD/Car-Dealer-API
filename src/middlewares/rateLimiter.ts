import rateLimit from "express-rate-limit";

// Limit to 10 requests per minute per IP for login
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 100 requests per window
        message: {
            success: false,
            message: "Too many login attempts. Please try again after a minute."
        },
    standardHeaders: true,
    legacyHeaders: false,
})