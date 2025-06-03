import Car from "../../models/Car";
import { Status } from "../../interfaces/enums";
import Transaction from "../../models/Transaction";
import { Customer } from "../../models/User";
import CarService from "../../services/CarService";
import PaymentService from "../../services/PaymentService";
import CustomerService from "../../services/CustomerService";
import { asyncHandler } from "../../middlewares/errorHandler";

export const carService = new CarService(Car)
export const customerService = new CustomerService(Customer)

export const purchaseCar =  asyncHandler(async (req, res) =>  {
    const { carId } = req.params
    const userId = req.user!._id

    const user = await customerService.findById(userId)
    if (!user) {
        res.status(404).json({
            success: false,
            message: "User not found"
        })
        return
    }

    const car = await carService.getCarById(carId)
    if (!car) {
        res.status(404).json({
            success: false,
            message: "Car not found"
        })
        return
    }

    // Check if car has available units
    if (!car.units || car.units.length < 1) {
        res.status(400).json({
            success: false,
            message: "Car is out of stock"
        })
        return
    }

    // initiate payment
    const payment = await PaymentService.initiatePayment(
        user.email,
        car.price,
       {  car: carId,  user: userId }
    )  

    res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        payment_link: payment.authorization_url
    })
})

export const completePurchase = asyncHandler(async (req, res) => {
    const { reference } = req.body;
    const userId = req.user!._id;

    if (!reference) {
    res.status(400).json({
        success: false,
        message: "Reference is required!"
    })
    return 
}

    // Verify payment with Paystack
    const verification = await PaymentService.verifyPayment(reference);
    if (!verification || verification.success === false) {
        res.status(400).json({
            success: false,
            message: verification.message || "Payment verification failed"
        })
        return 
    }

    // Find the transaction
    const transaction = await Transaction.findOne({ reference });
    if (!transaction || !transaction.metadata || !transaction.metadata.car) {
        res.status(404).json({
            success: false,
            message: "Transaction not found or already completed"
        })
        return
    }

    const carId = transaction.metadata.car.toString()
    
    // Find the car and an available unit
    const car = await carService.getCarById(carId)
    if (!car) {
        res.status(404).json({
            success: false,
            message: 'Car not found!'
        })
        return
    }

    // Find an available unit
    const availableUnit = car.units.find((unit: any) => unit.isAvailable !== false);
    if (!availableUnit) {
        res.status(400).json({
            success: false,
            message: "No available unit found for this car"
        })
        return 
    }

    // Assign unit to user and mark it as unavailable
    availableUnit.isAvailable = false
    
    const user = await customerService.updateById(userId, {
        $push: {
            carsPurchased: {
                car: carId,
                vin: availableUnit.vin,
                price: car.price,
                date: new Date()
            }
        }
    })

    if (!user) {
        res.status(404).json({
            success: false,
            message: "User not found"
        })
        return 
    }
    
    // update transaction status
    transaction.status = Status.Success

    await transaction.save()

    res.status(200).json({
        success: true,
        message: "Purchase completed successfully",
        vin: availableUnit.vin
    });
})

export const getPurchasedCar = asyncHandler(async (req, res) => {
    const userId = req.user!._id
    const { carId } = req.params

    const customer = await customerService.findUser({
        _id: userId,
        'carsPurchased.car': carId
    })
    
    if (!customer) {
        res.status(404).json({
            message: 'Purchased car not found'
        })
        return
    }

    // Find the specific purchased car entry
    const purchasedCar = customer.carsPurchased?.find(
        (c) => c.car.toString() === carId
    )

    if (!purchasedCar) {
        res.status(404).json({
            message: 'Purchased car not found'
        })
        return
    }

    res.status(200).json({
        success: true,
        message: 'Car fetched successfully',
        data: {
            price: purchasedCar.price,
            vin: purchasedCar.vin,
            date: (purchasedCar.date).toLocaleDateString()
        }
    })
})