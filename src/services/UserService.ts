import { Document, Model } from "mongoose";
import { IBaseUser } from "../interfaces/user";

class UserService {
    private userModel: Model<IBaseUser>
    
    constructor(userModel: Model<IBaseUser>) {
        this.userModel = userModel
    }

    async findByEmail(email: string): Promise<IBaseUser & Document | null> {
        return this.userModel.findOne({ email })
    }

    async findById(id: string): Promise<IBaseUser | null> {
        return this.userModel
            .findById(id)
            .select('name email phoneNumber role -_id')
            .lean()
    }

    async getAllUser(pageNumber: number, pageSize: number): Promise<{ users: IBaseUser[], totalCount: number }> {
        
        const skip = (pageNumber - 1) * pageSize

        const [ users, totalCount ] = await Promise.all([
            this.userModel
                .find()
                .select('name phoneNumber role -_id')
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.userModel.countDocuments()
        ])
        return { users, totalCount }
       
    }

    async updateUser(email: string, updateData: object): Promise<IBaseUser | null> {
        return this.userModel.findOneAndUpdate(
            { email },
            updateData, 
            { new: true, runValidators: true } 
        )
    }

    async deleteUser() {
        
    }
}

export default UserService