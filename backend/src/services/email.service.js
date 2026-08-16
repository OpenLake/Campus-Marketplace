import nodemailer from "nodemailer";

// Create a reusable transporter object using the default SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const getEmailTemplate = (type, data) => {
  switch (type) {
    case "NEW_REQUEST":
      return {
        subject: `New Request for your listing: ${data.itemTitle}`,
        html: `
          <h3>Hi ${data.sellerName},</h3>
          <p><strong>${data.buyerName}</strong> is interested in buying your item <strong>${data.itemTitle}</strong>.</p>
          <p>Offered Price: ₹${data.offeredPrice}</p>
          ${data.message ? `<p>Message: "${data.message}"</p>` : ""}
          <p>Please log in to your account and go to your dashboard to review this request.</p>
        `,
      };
    case "REQUEST_SUBMITTED":
      return {
        subject: `Your request for ${data.itemTitle} has been sent!`,
        html: `
          <h3>Hi ${data.buyerName},</h3>
          <p>Your request for <strong>${data.itemTitle}</strong> has been successfully sent to the seller.</p>
          <p>Offered Price: ₹${data.offeredPrice}</p>
          <p>We'll notify you as soon as the seller responds.</p>
        `,
      };
    case "REQUEST_ACCEPTED":
      return {
        subject: `🎉 Good news! Your request for ${data.itemTitle} was accepted`,
        html: `
          <h3>Hi ${data.buyerName},</h3>
          <p><strong>${data.sellerName}</strong> has accepted your request for <strong>${data.itemTitle}</strong> at <strong>₹${data.finalPrice}</strong>!</p>
          <p>It's time to arrange a meetup. Please log in to your dashboard to finalize details.</p>
          <p><em>Remember to verify the item condition during the meetup before paying.</em></p>
        `,
      };
    case "REQUEST_REJECTED":
      return {
        subject: `Update on your request for ${data.itemTitle}`,
        html: `
          <h3>Hi ${data.buyerName},</h3>
          <p>Unfortunately, the seller has declined your request for <strong>${data.itemTitle}</strong>.</p>
          <p>Don't worry, there are plenty of other items on the campus marketplace.</p>
        `,
      };
    case "ORDER_COMPLETED":
      return {
        subject: `Receipt: Your purchase of ${data.itemTitle} is complete`,
        html: `
          <h3>Hi ${data.buyerName},</h3>
          <p>The seller has marked your transaction for <strong>${data.itemTitle}</strong> as complete.</p>
          <p>Final Price: ₹${data.finalPrice}</p>
          <p>We hope you enjoy your new item!</p>
        `,
      };
    case "ORDER_CANCELLED":
      return {
        subject: `Order Cancelled: ${data.itemTitle}`,
        html: `
          <h3>Hi ${data.recipientName},</h3>
          <p>The order for <strong>${data.itemTitle}</strong> has been cancelled by ${data.cancellerRole}.</p>
          <p>Reason: "${data.reason}"</p>
        `,
      };
    default:
      return {
        subject: "Notification from Campus Marketplace",
        html: `<p>You have a new notification.</p>`,
      };
  }
};

export const sendEmailNotification = async (to, type, data, replyTo = null) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not set. Simulating email send for dev/test.");
      return true;
    }

    const transporter = createTransporter();
    const template = getEmailTemplate(type, data);

    const mailOptions = {
      from: `"Campus Marketplace" <${process.env.SMTP_USER}>`,
      to: to,
      subject: template.subject,
      html: template.html,
    };

    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email dispatched to ${to} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error("Error sending email notification via Nodemailer:", error);
    return false;
  }
};
