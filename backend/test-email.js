// require('dotenv').config();
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

async function sendTestEmail() {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST, // smtp.gmail.com
            port: process.env.EMAIL_PORT, // 587
            secure: false, // true for port 465, false for 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: "bachhanamitabh344@gmail.com", // change to your email
            subject: "SMTP Test",
            text: "This is a test email from Nodemailer + Gmail."
        });

        console.log("Email sent:", info.response);
    } catch (error) {
        console.error(" Error sending email:", error);
    }
}

sendTestEmail();