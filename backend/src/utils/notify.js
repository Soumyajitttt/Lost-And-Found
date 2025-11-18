import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const FROM_EMAIL = process.env.FROM_EMAIL;

const notifyMatch = async ({ toItem, matchedItem, score }) => {
  const to = toItem.owner.email;
  if (!to) return;

  const subject = `Possible match found for your ${toItem.type} item: ${toItem.title}`;
  const text = `A ${matchedItem.type} item "${matchedItem.title}" was matched to your item with a match of ${(score * 100).toFixed(1)}%.\n\nDescription: ${matchedItem.description || "n/a"}\nLocation: ${matchedItem.location || "n/a"}\n\nPlease go to the admin room to confirm.`;

  return transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    text
  });
};

// --- NEW FUNCTION ADDED ---
const notifyFinderToSubmitItem = async ({ user, item }) => {
    const to = user.email;
    if (!to) {
        console.error("Cannot send submission email: user email is missing.");
        return;
    }

    const subject = `Action Required: Please Hand Over Your Found Item "${item.title}"`;
    const text = `
Hello ${user.name},

Thank you for reporting a found item: " ${item.title} ".

To complete the process, you must bring the physical item to the admin room for verification as soon as possible.

Once the item is verified by an admin, it will be entered into our system to find its owner.

Thank you for your honesty and cooperation!

- The Lost & Found Team
    `;
    const html = `
      <p>Hello ${user.name},</p>
      <p>Thank you for reporting a found item: <strong>"${item.title}"</strong>.</p>
      <p>To complete the process and activate your submission for matching, you must bring the physical item to the <strong>admin office for verification</strong> as soon as possible.</p>
      <p>Once the item is verified by an admin, it will be entered into our system to find its owner.</p>
      <p>Thank you for your honesty and cooperation!</p>
      <br>
      <p>- The Lost & Found Team</p>
    `;

    return transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        text,
        html // Include HTML for better formatting in email clients
    });
};
// --- END OF NEW FUNCTION ---

export default {
  notifyMatch,
  notifyFinderToSubmitItem // Export the new function
};