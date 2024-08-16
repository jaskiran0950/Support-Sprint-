import { getUserById } from "@/lib/db";
import { updateUserById } from "@/lib/db";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  const token = await getToken({ req, secret });

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const userId = token.userId;

  if (req.method === "GET") {
    try {
      const user = await getUserById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const { name, mobile } = req.body;
      const updatedUser = await updateUserById(userId, { name, mobile });

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "User updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
