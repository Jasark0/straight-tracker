import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request){
    try{
        const { name, email, message } = await req.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'straighttrackerinfo@gmail.com',
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: email,
            to: 'straighttrackerinfo@gmail.com',
            subject: `Suggestion from ${name}`,
            text: message,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true }, { status: 200 });
    } 
    catch (error){
        console.error('Email send error:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error },
            { status: 500 }
        );
    }
}
