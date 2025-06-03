import { Document, Model } from "mongoose"
import { IManager } from "../interfaces/user"
import { Types } from "mongoose"

class ManagerService {
    private managerModel: Model<IManager>

    constructor(managerModel: Model<IManager>) {
        this.managerModel = managerModel
    }

    /* create a new customer -- takes in partial data from the user interface 
    *   returns a promise that will resolve into the interface object
    *   taking partial data was because some fields are not required
    */
    async create(data: Partial<IManager>): Promise<IManager> {
        const user = new this.managerModel(data)
        return user.save()
    }

    async findByEmail(email: string): Promise<IManager | null> {
        return this.managerModel.findOne({ email })
    }

    async findById(id: string): Promise<IManager & Document | null> {
        return this.managerModel.findById(id)
    }

    async update(email: string, updateData: object): Promise<IManager | null> {
        return this.managerModel.findOneAndUpdate(
            { email },
            updateData, 
            { new: true, runValidators: true } 
        )
            .select('phoneNumber address qualifications')
            .lean()
            .exec()
    }

    async updateById(id: string | Types.ObjectId, updateData: object): Promise<IManager | null> {
        return this.managerModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
    }
} 

export default ManagerService