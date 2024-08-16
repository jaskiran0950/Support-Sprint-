import { updateTag, deleteTag } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const { name } = req.body;
      const updatedTag = await updateTag(id, { name });

      res.status(200).json({ success: true, data: updatedTag });
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(500).json({ error: "Failed to update tag" });
    }
  } else if (req.method === "DELETE") {
    try {
      await deleteTag(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ error: "Failed to delete tag" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
