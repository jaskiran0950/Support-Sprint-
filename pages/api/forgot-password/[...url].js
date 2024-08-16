import { findUser } from "@/lib/db";
import sendMail from "@/utils/mail";
import generateOTP from "@/utils/general";
import { ForgotPassword } from "@/lib/db";
import { VerifyOTP } from "@/lib/db";
import { ResetPassword } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const url = req.url.split("/");

    const endpoint = url[url.length - 1];

    if (endpoint == "check-user") {
      const { email } = req.body;

      const user = await findUser(email);

      if (user) {
        const otp = generateOTP();
        await ForgotPassword(email, otp);

        const mailOptions = {
          from: "ssprint01.help@gmail.com",
          to: email,
          subject: "OTP to reset password.",
          text: `Your OTP for forgot password request is: ${otp}`,
        };

        const mail = await sendMail(mailOptions);

        if (mail) {
          return res.status(200).json({ exists: true });
        } else {
          return res.status(500).json({ error: "Failed to send OTP email" });
        }
      } else {
        return res.status(400).json({ exists: false });
      }
    } else if (endpoint == "verify-otp") {
      const { email, otp } = req.body;

      const otpRecord = await VerifyOTP(email, otp);

      if (otpRecord) {
        return res.status(200).json({ verified: true });
      } else {
        return res.status(400).json({ verified: false });
      }
    } else if (endpoint === "reset-password") {
      const { email, newPassword } = req.body;

      const resetResult = await ResetPassword(email, newPassword);

      if (resetResult) {
        const mailOptions = {
          from: "ssprint01.help@gmail.com",
          to: email,
          subject: "Password has been reset",
          text: "Hello! Your Password has been reset.",
        };

        const mail = await sendMail(mailOptions);

        return res.status(200).json({ success: true });
      } else {
        return res.status(500).json({ success: false });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
