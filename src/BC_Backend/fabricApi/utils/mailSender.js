const nodemailer = require("nodemailer");
const db = require("../config/connectToDB");
const transporter = require("../config/mailConfig");

/**
 * Hàm gửi email với nội dung tùy chỉnh
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} bodyContent - Nội dung email chính (được nhúng vào giữa header và footer)
 */
async function sendEmail(to, subject, bodyContent) {
    try {
        // Email template (Header + Nội dung + Footer)
        let emailTemplate = `
            <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f9f9f9; padding: 20px;">
                <!-- Header -->
                <div style="text-align: center; background-color: #0044cc; color: white; padding: 15px; border-radius: 5px;">
                    <h2>${subject}</h2>
                </div>
                
                <!-- Nội dung email -->
                <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    ${bodyContent}
                </div>

                <!-- Footer -->
                <hr />
                <p style="text-align: center; font-size: 14px; color: #666;">
                    &copy; 2025 Hyperledger Credential System. Mọi quyền được bảo lưu.
                </p>
            </div>
        `;

        // Cấu hình email
        let mailOptions = {
            from: `"Hyperledger Admin" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: emailTemplate,
        };

        // Gửi email
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);

        return {
            success: true,
            message: "Email sent successfully",
        };
    } catch (error) {
        console.error("Error sending email: ", error);
        return {
            success: false,
            message: "Failed to send email",
            error: error.message,
        };
    }
}

module.exports = { sendEmail };
