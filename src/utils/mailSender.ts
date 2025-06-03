import nodemailer from 'nodemailer'

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        })
        
        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to,
            subject,
            html
        }

        await transporter.sendMail(mailOptions)
        
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(` Email send failed: ${error.message}`)
        }
        throw error
    }
}

