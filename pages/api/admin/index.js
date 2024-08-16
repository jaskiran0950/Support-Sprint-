import { getAllAdmins, addAdmin, findUser } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import generatePassword from "generate-password";
import sendMail from "@/utils/mail";
import { UserRoles } from "@/utils/constants";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const admins = await getAllAdmins();
      res.status(200).json({ success: true, data: admins });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch admins" });
    }
  } else if (req.method === "POST") {
    try {
      const token = await getToken({ req, secret });
      const userId = token.userId;

      const { email, ...data } = req.body;
      data.created_by = userId;
      data.updated_by = userId;

      const existingAdmin = await findUser(email);
      if (existingAdmin) {
        return res
          .status(400)
          .json({ success: false, error: "Email already exists" });
      }

      const password = generatePassword.generate({
        length: 10,
        numbers: true,
      });

      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
      data.email = email;
      data.role = UserRoles.Admin;

      const newAdmin = await addAdmin(data);

      const mailOptions = {
        from: "ssprint01.help@gmail.com",
        to: email,
        subject: "New Admin Account Created.",
        text: `Your account has been created. Your password is: ${password}`,
      };
      await sendMail(mailOptions);

      res.status(201).json({ success: true, data: newAdmin });
    } catch (error) {
      console.error("Failed to add admin:", error);
      res.status(500).json({ success: false, error: "Failed to add admin" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res
      .status(405)
      .json({ success: false, error: `Method ${req.method} Not Allowed` });
  }
}
