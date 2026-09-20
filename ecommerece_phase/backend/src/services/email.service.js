import nodemailer from "nodemailer";

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

// Light shared wrapper so every email has consistent, readable styling
// without pulling in a templating engine. Kept deliberately simple —
// swap for a proper template system later if the design needs grow.
const emailLayout = (title, bodyHtml) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
    <h2 style="color: #111827; margin-bottom: 4px;">${title}</h2>
    <div style="font-size: 14px; line-height: 1.6;">${bodyHtml}</div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 12px; color: #9ca3af;">
      This is an automated email — please don't reply directly to it.
    </p>
  </div>
`;

const sendVerificationEmail = async (user, token) => {
  const link = `${process.env.CLIENT_URL}/${user.language || "en"}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: emailLayout(
      "Verify your email",
      `<p>Hi ${user.name},</p>
       <p>Please verify your email address by clicking the link below (expires in 24 hours):</p>
       <p><a href="${link}">${link}</a></p>`,
    ),
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const link = `${process.env.CLIENT_URL}/${user.language || "en"}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: emailLayout(
      "Reset your password",
      `<p>Hi ${user.name},</p>
       <p>We received a request to reset your password. This link expires in 1 hour and can only be used once:</p>
       <p><a href="${link}">${link}</a></p>
       <p>If you didn't request this, you can safely ignore this email.</p>`,
    ),
  });
};

const sendOrderStatusEmail = async (user, order) => {
  const statusLabel = order.status.replace(/_/g, " ");
  await sendEmail({
    to: user.email,
    subject: `Order ${order.orderNumber} — ${statusLabel}`,
    html: emailLayout(
      "Order update",
      `<p>Hi ${user.name},</p>
       <p>Your order <strong>${order.orderNumber}</strong> status is now: <strong>${statusLabel}</strong>.</p>
       ${order.trackingUrl ? `<p>Track it here: <a href="${order.trackingUrl}">${order.trackingUrl}</a></p>` : ""}`,
    ),
  });
};

/**
 * Invites a customer to review what they bought, after delivery. Not
 * wired to an automatic trigger yet — call this from wherever an order
 * transitions to "delivered" (Phase 7's admin status-update flow).
 */
const sendReviewRequestEmail = async (user, order) => {
  const link = `${process.env.CLIENT_URL}/${user.language || "en"}/orders/${order.id}#review`;
  await sendEmail({
    to: user.email,
    subject: `How was your order ${order.orderNumber}?`,
    html: emailLayout(
      "How was it?",
      `<p>Hi ${user.name},</p>
       <p>Your order <strong>${order.orderNumber}</strong> was delivered — we'd love to hear what you thought.</p>
       <p><a href="${link}">Leave a review</a></p>`,
    ),
  });
};

export {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderStatusEmail,
  sendReviewRequestEmail,
};
