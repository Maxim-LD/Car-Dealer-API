import mongoose from "mongoose";
import { ITransaction } from "../interfaces/transaction";
import { Status } from "../interfaces/enums";

const TransactionSchema = new mongoose.Schema<ITransaction>({
    email: { type: String, required: true},
    amount: { type: Number, required: true },
    reference: { type: String, required: true, unique: true },
    metadata: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true }
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.Pending
    },
},
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", TransactionSchema)

export default Transaction