const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (user, token) => {
  const link = `${process.env.CLIENT_URL}/${user.language || "en"}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: `<p>Hi ${user.name},</p>
           <p>Please verify your email address by clicking the link below (expires in 24 hours):</p>
           <p><a href="${link}">${link}</a></p>`,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const link = `${process.env.CLIENT_URL}/${user.language || "en"}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `<p>Hi ${user.name},</p>
           <p>We received a request to reset your password. This link expires in 1 hour and can only be used once:</p>
           <p><a href="${link}">${link}</a></p>
           <p>If you didn't request this, you can safely ignore this email.</p>`,
  });
};

const sendOrderStatusEmail = async (user, order) => {
  await sendEmail({
    to: user.email,
    subject: `Order ${order.orderNumber} — ${order.status.replace(/_/g, " ")}`,
    html: `<p>Hi ${user.name},</p>
           <p>Your order <strong>${order.orderNumber}</strong> status is now: <strong>${order.status}</strong>.</p>`,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderStatusEmail,
};
