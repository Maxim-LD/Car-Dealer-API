import { User } from "../../models/User";
import UserService from "../../services/UserService";
import { asyncHandler } from "../../middlewares/errorHandler";
import { comparePassword } from "../../utils/password";
import { generateAccessToken, generateRefreshToken } from "../../utils/token"

export const userService = new UserService(User)

export const login = asyncHandler(async (req, res) => {    
    const { email, password } = req.body

    const exists = await userService.findByEmail(email) // returns null (then stop) or data to be used later on
    if (!exists) {
        res.status(404).json({
            success: false,
            message: 'User account dose not exist!'
        })
        return
    }    
    
    const verifyPassword = await comparePassword(password, exists.password)// return a boolean promise 
    if (!verifyPassword) {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials!'
        })
        return
    }

    const id = exists.id
    const role = exists.role

    const accessToken = generateAccessToken(id, role)
    const refreshToken = generateRefreshToken(id, role)

    res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/'
    })

    res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
            accessToken: accessToken,
            role: role
        },
        headers: {
            limit: res.getHeaders()['ratelimit-limit'],
            remaining: res.getHeaders()["ratelimit-remaining"],
            reset: res.getHeaders()["ratelimit-reset"],
        }
    })
})

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie('refresh-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
        // Optionally, you can add a hint for the client:
        // info: 'Please remove your access token from storage'
    });
})




