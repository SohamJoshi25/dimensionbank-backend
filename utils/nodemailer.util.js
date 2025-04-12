const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password, not your actual password
  },
});

/**
 * Sends an OTP email to a given recipient
 * @param {string} to - Recipient's email
 * @param {string} otp - One-Time Password
 */
async function sendOtpMail(to, otp) {
  const mailOptions = {
    from: `"Dimension Bank" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP for Dimension Bank Login",
    html: `
      <div style="font-family: sans-serif;">
        <h2>🛡️ OTP Verification</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you didn’t request this, please ignore the email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send OTP to ${to}:`, err.message);
    throw err;
  }
}

module.exports = { sendOtpMail };
