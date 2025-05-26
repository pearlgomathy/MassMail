const nodemailer = require('nodemailer');
const { database } = require('./config'); // Import the database pool
require('dotenv').config();

// 1. Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
  },
});
// const users = [
//   {
//     userId: 1,
//     firstName: "John",
//     lastName: "Doe",
//     email: "Johndoe@gmail.com",
//     username: "johndoe"
//   }
// ]
async function sendEmails() {
  try {
 
  const query = 'SELECT userId, firstName, lastName, email, username FROM user';//change based on the condition
  const users = await database.query(query); // Using the pool's query method
for (let i = 0; i < users.length; i++) {console.log(i)}
    // Loop through users and send the emails
    for (let i = 0; i < users.length; i++) {
      const { firstName, lastName, email, username } = users[i];

      // Skip invalid email addresses
      if (!email || !validateEmail(email)) {
        console.log(`Skipping invalid email: ${email}`);
        continue;
      }

      const subject = "ERP Suite Credentials";
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #2c3e50; text-align: center;">Welcome to Marlin ERP Suite!</h2>
              <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${firstName} ${lastName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6;">We are excited to introduce you to our ERP Suite, <strong>Marlin</strong>. Below are your account credentials:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 10px; font-size: 16px; border: 1px solid #ddd; background-color: #f9f9f9;">Username</td>
                  <td style="padding: 10px; font-size: 16px; border: 1px solid #ddd;">${username}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-size: 16px; border: 1px solid #ddd; background-color: #f9f9f9;">Password</td>
                  <td style="padding: 10px; font-size: 16px; border: 1px solid #ddd;">${firstName}@123</td>
                </tr>
              </table>
              <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
                For security purposes, we strongly recommend that you change your password as soon as possible. You can do so by logging into your account at <a href="https://matrixmindz.com/" target="_blank">matrixmindz.com</a> and updating your credentials.
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
                If you have any questions or need assistance, please feel free to reach out to our support team at <a href="mailto:matrixmindz.contact@gmail.com">matrixmindz.contact@gmail.com</a>.
              </p>
              <p style="font-size: 16px; line-height: 1.6;">Best regards,</p>
              <p style="font-size: 16px; line-height: 1.6; font-weight: bold;">The ERP Team</p>
              <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 14px; color: #7f8c8d;">&copy; 2025 Marlin, All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        const info = await transporter.sendMail({
          from: `"Matrix Mindz" <${process.env.EMAIL}>`,
          to: email,
          subject: subject,
          html: htmlContent,
        });

        console.log(`Sent to ${email}: ${info.messageId}`);
      } catch (err) {
        console.error(`Failed to send to ${email}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Failed to fetch users from the database:', err.message);
  }
}

// Simple email validation function
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

sendEmails();
