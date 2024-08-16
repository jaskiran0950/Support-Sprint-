import { deleteComment } from "@/lib/db";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const token = await getToken({ req, secret });

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.query;
    const userId = token.userId;

    try {
      const result = await deleteComment(id, userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
