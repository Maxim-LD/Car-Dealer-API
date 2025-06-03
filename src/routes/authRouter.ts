import express from 'express'
import { validateLogin, validatePasswordReset } from '../validations/auth'
import { login, logout } from '../controllers/auth/auth'
import { loginLimiter } from '../middlewares/rateLimiter'
import { forgotPasswordLink, resetPassword } from '../controllers/auth/passwordReset'

const authRouter = express.Router()

// general login route for all users
authRouter.post('/login', validateLogin, loginLimiter, login)
authRouter.post('/logout', logout)

authRouter.post('/forget-password', forgotPasswordLink)
authRouter.post('/reset-password/', validatePasswordReset, resetPassword)

export default authRouter