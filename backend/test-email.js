import "dotenv/config";
import { sendEmailNotification } from "./src/services/email.service.js";

async function test() {
  console.log("Testing email service connection using Nodemailer...");
  console.log("SMTP User defined:", !!process.env.SMTP_USER);

  // Replace this with your own email to test
  const testEmail = "test@example.com";

  const success = await sendEmailNotification(testEmail, "NEW_REQUEST", {
    itemTitle: "Calculus Textbook",
    sellerName: "Alice",
    buyerName: "Bob",
    offeredPrice: 500,
    message: "Is this still available?"
  });

  if (success) {
    console.log("✅ Successfully dispatched email via Nodemailer!");
  } else {
    console.log("❌ Failed to dispatch email. Check your SMTP_USER and SMTP_PASS.");
  }
}

test();
