const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});
const sendVerificationMail = async (email, name, token) => {
  const verifyLink = `http://localhost:3001/api/users/verify-email/${token}`;

  await transporter.sendMail({
    from: `"ShopMate" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Verify your email",
    html: `<h2>Welcome ${name}</h2>
        <p>Please verify your email to activate your account.</p>
        <a href="${verifyLink}">Verify Email</a>
        `,
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"ShopMate" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendVerificationMail, sendEmail };
