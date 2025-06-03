import { asyncHandler } from "../../middlewares/errorHandler";
import { Manager } from "../../models/User";
import ManagerService from "../../services/ManagerService";

export const managerService = new ManagerService(Manager)

export const updateProfile = asyncHandler(async (req, res) => {
    const { email } = req.params 
    if (!email) {
        res.status(400).json({
            success: false,
            message: 'Email is required!'
        })
        return
    }

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        res.status(400).json({
            success: false,
            message: 'Invalid email format!'
        })
        return
    }
        
    const { phoneNumber, address, qualifications } = req.body
    
    const updateData: any = {}

    if (phoneNumber) updateData.phoneNumber = phoneNumber
    if (address) updateData.address = address
    if (qualifications) {
        updateData.$addToSet = {
            qualifications: {
                $each: Array.isArray(qualifications) ? qualifications : [qualifications]
            }
        };
    }

    if (Object.keys(updateData).length === 0) {
        res.status(400).json({
            success: false,
            message: 'No update data provided!'
        })
        return
    }
    
    const updatedManager = await managerService.update(email, updateData)

    if (!updatedManager) {
        res.status(404).json({
            success: false,
            message: 'Manager not found!'
        })
        return
    }

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedManager
    })

})