const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 10000, // 10 detik
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

async function sendEmail(to, subject, html) {
  try {
    let info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

// Contoh testing, bisa di-comment setelah dicek
// sendEmail(
//   "rakhaarkhana98@gmail.com",
//   "Test OTP Email",
//   "<h1>Ini test email</h1>"
// );

module.exports = { sendEmail };
