// utils/sendReceiptEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendReceiptEmail = async ({ to, name, plan, amount, expiresAt }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>🧾 StudyNest Payment Receipt</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for subscribing to the <strong>${plan}</strong> plan.</p>
        <p><strong>Amount Paid:</strong> ₹${(amount / 100).toFixed(2)}</p>
        <p><strong>Access Valid Till:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>
        <br/>
        <p>Keep learning with <strong>StudyYatra</strong>! 📚</p>
      </div>
    `;

    const mailOptions = {
      from: `"StudyNest" <${process.env.EMAIL_USER}>`,
      to,
      subject: `✅ Payment Receipt for ${plan} Subscription`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Receipt sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Failed to send receipt email:", error);
  }
};
