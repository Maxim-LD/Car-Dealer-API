import { asyncHandler } from "../../middlewares/errorHandler";
import { Manager, User } from "../../models/User";
import ManagerService from "../../services/ManagerService";
import UserService from "../../services/UserService";
import { hashPassword } from "../../utils/password";

const managerService = new ManagerService(Manager)
const userService = new UserService(User)

export const signup = asyncHandler(async (req, res) => {

    const { name, email, password, confirmPassword, phoneNumber, address, qualifications, yearsExperience } = req.body
    
    const exists = await userService.findByEmail(email)
    if (exists) {
            res.status(409).json({
            success: false,
            message: 'User already exist!'
        })
        return
    }
    

    if (password !== confirmPassword) {
        res.status(400).json({
            success: false,
            message: 'Passwords do not match!'
        })
        return
    }

    const hashedPassword = await hashPassword(password)

    const newUserData = {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        address,
        qualifications, // to be modified to documents upload later on
        yearsExperience,
    }

    // uses the manager service to create user with default manager role
    const newUser = await managerService.create(newUserData)

    res.status(201).json({
        success: true,
        message: 'User account created successfully',
        data: {
            name: newUser.name,
            email: newUser.email,
            date: new Date(newUser.createdAt ?? Date.now()).toLocaleString()
        }
    })

})



