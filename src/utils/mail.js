import Mailgen from "mailgen";

import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailgen = new Mailgen({
        theme: "default",
        product: {
            name: "Project Management",
            link: "https://project-management-mrutunjay.vercel.app/"
        }
    })
    const emailTextual = mailgen.generatePlaintext(options.mailgenContent)
    const emailHtml = mailgen.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASSWORD
        }
    })
    const mail = {
        from: "Project Management <projectmanagement@projectmanagement.com>",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Error sending email:", error.message)
        throw new Error(error.message)

    }
}

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to Project Management! We're very excited to have you on board.",
            action: {
                instructions: "To get started with Project Management, please click the button below:",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: verificationUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

const forgotPasswordMailgenContent = (username, resetUrl) => {
    return {
        body: {
            name: username,
            intro: "You recently requested to reset the password for your Project Management account. Click the button below to proceed.",
            action: {
                instructions: "To reset your password, please click the button below:",
                button: {
                    color: "#22BC66",
                    text: "Reset Password",
                    link: resetUrl
                }
            },
            outro: "If you did not request a password reset, please ignore this email or reply to let us know. This password reset link is only valid for the next 30 minutes."
        }
    }
}


export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}