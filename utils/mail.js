import { storeSentEmail } from "@/lib/db";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "ssprint01.help@gmail.com",
    pass: "kqav oepc kntk cvld",
  },
});

export default async function sendMail(mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions);

    await storeSentEmail(mailOptions);

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
