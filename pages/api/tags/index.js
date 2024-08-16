import { getAllTags, createTag } from "@/lib/db";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  const token = await getToken({ req, secret });
  const organizationId = token.organization;
  if (req.method === "GET") {
    try {
      const tags = await getAllTags(organizationId);
      res.status(200).json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  } else if (req.method === "POST") {
    try {
      const token = await getToken({ req, secret });
      const organizationId = token.organization;

      const { name } = req.body;
      const newTag = await createTag({ name, organization_id: organizationId });

      res.status(201).json({ success: true, data: newTag });
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ error: "Failed to create tag" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
