import { getAllContacts } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const contacts = await getAllContacts();
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
