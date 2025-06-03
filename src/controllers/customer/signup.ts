import { Customer } from "../../models/User";
import { hashPassword } from "../../utils/password";
import CustomerService from "../../services/CustomerService";
import { asyncHandler } from "../../middlewares/errorHandler";

// Instantiate once, reuse everywhere
export const customerService = new CustomerService(Customer);

export const signup = asyncHandler(async (req, res) => {
    const { name, email, password, confirmPassword, phoneNumber, address } = req.body;

    // Checks if the user exists
    const exists = await customerService.findByEmail(email);
    if (exists) {
        res.status(409).json({
            success: false,
            message: 'User already exist!'
        });
        return;
    }

    if (password !== confirmPassword) {
        res.status(400).json({
            success: false,
            message: 'Passwords do not matc!'
        });
        return;
    }
    const hashedPassword = await hashPassword(password);

    const newUserData = {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        address,
    };
    
    const newUser = await customerService.create(newUserData);

    res.status(201).json({
        success: true,
        message: 'User account created successfully',
        data: {
            name: newUser.name,
            email: newUser.email,
            date: new Date(newUser.createdAt ?? Date.now()).toLocaleString()
        }
    });
});