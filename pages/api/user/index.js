import { getAllUsers, addAdmin, findUser } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import generatePassword from "generate-password";
import sendMail from "@/utils/mail";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const token = await getToken({ req, secret });
      const organization = token.organization;

      const users = await getAllUsers(organization);
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
  } else if (req.method === "POST") {
    try {
      const token = await getToken({ req, secret });
      const userId = token.userId;
      const organization = token.organization;

      const { email, ...data } = req.body;
      data.created_by = userId;
      data.updated_by = userId;
      data.organization_id = organization;

      const existingUser = await findUser(email);
      if (existingUser) {
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

      const newUser = await addAdmin(data);

      const mailOptions = {
        from: "ssprint01.help@gmail.com",
        to: email,
        subject: "New User Account Created.",
        text: `Your account has been created. Your password is: ${password}`,
      };
      await sendMail(mailOptions);

      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      console.error("Failed to add user:", error);
      res.status(500).json({ success: false, error: "Failed to add user" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res
      .status(405)
      .json({ success: false, error: `Method ${req.method} Not Allowed` });
  }
}
