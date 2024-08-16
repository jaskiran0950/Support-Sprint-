import { getUserById, updateUserPassword } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import sendMail from "@/utils/mail";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  const token = await getToken({ req, secret });

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const userId = token.userId;

  if (req.method === "PUT") {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    try {
      const user = await getUserById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect old password" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await updateUserPassword(userId, hashedPassword);

      const mailOptions = {
        from: "ssprint01.help@gmail.com",
        to: user.email,
        subject: "Password has been reset",
        text: "Hello! Your Password has been reset.",
      };

      const mailSent = await sendMail(mailOptions);

      if (mailSent) {
        res.status(200).json({
          success: true,
          message: "Password updated ",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
