import { getSupportMembers } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const supportMembers = await getSupportMembers();
      res.status(200).json(supportMembers);
    } catch (error) {
      console.error("Failed to fetch support members:", error);
      res.status(500).json({ error: "Failed to fetch support members" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
