import dotenv from 'dotenv'
import jwt, { JwtPayload } from 'jsonwebtoken'

dotenv.config()

const secretkey = process.env.SECRET_KEY
const refreshkey = process.env.REFRESH_KEY

const generateAccessToken = (id: string, role: string): string => {
    try {
        const payload = {
            id: id,
            role: role
        }

        const options: jwt.SignOptions = { expiresIn: '2h' }

        const accessToken = jwt.sign(payload, secretkey as string, options)

        return accessToken

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(` Token generation failed: ${error.message}`)
        }
        throw error
    }
}

const generateRefreshToken = (id: string, role: string): string => {
    try {
        const payload = {
            id: id,
            role: role
        }

        const options: jwt.SignOptions = { expiresIn: '1d' }
        
        const refreshToken = jwt.sign(payload, refreshkey as string, options)
        
        return refreshToken
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(` Token generation failed: ${error.message}`)
        }
        throw error
    }
   
}

const verifyToken = (token: string): JwtPayload => {
    const decoded = jwt.verify(token, secretkey as string);
    
    if (typeof decoded === 'string') {
        throw new Error('Invalid token payload')
    }
    
    return decoded
}

export {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
}