const nodemailer = require('nodemailer');

const sendEmailWithImage = async (to, subject, text, base64Image) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'developer.sourabhsingh@gmail.com',
            pass: 'jvdf hdvf abvf xbzf'
        }
    });

    const mailOptions = {
        from: 'developer.sourabhsingh@gmail.com',
        to: to,
        subject: subject,
        text: text,
        attachments: [
            {
                filename: 'image.png',
                content: base64Image,
                encoding: 'base64'
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: 'Failed to send email', error: error.message };
    }
};


// Configure Nodemailer with your email service
const transporter = nodemailer.createTransport({
    service: 'Gmail', // or another email service provider
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password
    },
});

// Function to send emails
// const sendBulkEmails = async (recipients) => {
//     try {
//         for (const recipient of recipients) {
//             const { email, name } = recipient;
            
//             const mailOptions = {
//                 from: 'developer.sourabhsingh@gmail.com',
//                 to: email,
//                 subject: 'Subject of your email',
//                 text: `Hello ${name},\n\nThis is a test email.\n\nBest regards,\nYour Company`,
//                 // If you want to send HTML emails, you can use the 'html' property instead of 'text'
//                 // html: `<p>Hello ${name},</p><p>This is a test email.</p><p>Best regards,<br>Your Company</p>`,
//             };
            
//             await transporter.sendMail(mailOptions);
//             console.log(`Email sent to ${email}`);
//         }
//     } catch (error) {
//         console.error('Error sending bulk emails:', error);
//     }
// };

module.exports = { sendEmailWithImage };
