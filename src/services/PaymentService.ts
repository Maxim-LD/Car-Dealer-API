import { Status } from "../interfaces/enums";
import { ITransaction } from "../interfaces/transaction";
import Transaction from "../models/Transaction";

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

class PaymentService {
    private baseUrl = "https://api.paystack.co/transaction";

    async initiatePayment(email: string, amount: number, metadata: object): Promise<any> {
        try {
            const res = await fetch(`${this.baseUrl}/initialize`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    amount: amount * 100,
                    metadata
                })
            })

            if (!res.ok) {
                const error = await res.text();
                throw new Error(`Paystack error: ${error}`);
            }

            const data = await res.json();

            if (!data.status) {
                throw new Error(data.message || "Failed to initiate payment");
            }

            await Transaction.create({
                email,
                amount,
                reference: data.data.reference,
                status: Status.Pending,
                metadata
            });

            return data.data;
            
        } catch (error: any) {
            return { success: false, message: error.message || "Payment initiation failed" };
        }
    }

    async verifyPayment(reference: string): Promise<any> {
        try {
            const res = await fetch(`${this.baseUrl}/verify/${reference}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${SECRET_KEY}`
                }
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(`Paystack error: ${error}`);
            }

            const data = await res.json();

            if (data.data.status !== "success") {
                return { success: false, message: "Payment not successful" };
            }

            // Update transaction status
            const tx = await Transaction.findOneAndUpdate(
                { reference },
                { status: Status.Success }
            );

            if (!tx) return { success: false, message: "Transaction not found!" };

            if (tx.status === Status.Success) {
                return { message: "Payment has been verified already" };
            }

            return { success: true, message: "Payment verified successfully" };
        } catch (error: any) {
            return { success: false, message: error.message || "Payment verification failed" };
        }
    }
}

export default new PaymentService();