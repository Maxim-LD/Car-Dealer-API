import { Document, Model } from "mongoose"
import { IBaseUser, ICustomer } from "../interfaces/user"

class CustomerService {
    private customerModel: Model<ICustomer>

    constructor(customerModel: Model<ICustomer>) {
        this.customerModel = customerModel
    }

    /* create a new customer -- takes in partial data from the user interface 
    *   returns a promise that will resolve into the interface object
    */
    async create(data: Partial<ICustomer>): Promise<ICustomer> {
        const user = new this.customerModel(data)
        return user.save()
    }

    async findUser(data: object): Promise<ICustomer & Document | null> {
        return this.customerModel.findOne(data)
    }
    
    async findById(id: string): Promise<ICustomer & Document | null> {
        return this.customerModel.findById(id)
    }

    async findByEmail(email: string): Promise<IBaseUser & Document | null> {
        return this.customerModel.findOne({ email })
    }


    async getAllUser(pageNumber: number, pageSize: number): Promise<{ users: ICustomer[], totalCount: number }> {
        const skip = (pageNumber - 1) * pageSize

        const [ users, totalCount ] = await Promise.all([
            this.customerModel
                .find()
                .select('name phoneNumber role -_id')
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.customerModel.countDocuments()
        ])
        return { users, totalCount }
    }

    async updateByEmail(email: string, updateData: object): Promise<ICustomer | null> {
        return this.customerModel.findOneAndUpdate(
            { email },
            updateData, 
            { new: true, runValidators: true } 
        )
        .lean()
        .exec()
    }

    async updateById(userId: string, updateData: object): Promise<ICustomer | null> {
        return this.customerModel.findOneAndUpdate(
            { _id: userId },
            updateData, 
            { new: true, runValidators: true } 
        )
        .lean()
        .exec()
    }
} 

export default CustomerService