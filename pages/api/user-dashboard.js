import { getUserTicketsCount } from "@/lib/db";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = token.userId;
    const ticketCounts = await getUserTicketsCount(userId);
    res.status(200).json(ticketCounts);
  } catch (error) {
    console.error("Failed to fetch user ticket counts:", error);
    res.status(500).json({ message: "Failed to fetch user ticket counts" });
  }
}
