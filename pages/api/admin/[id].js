import { updateAdmin, deleteAdmin, getSupportMemberById } from "@/lib/db";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method === "PUT") {
    try {
      const updatedAdmin = await updateAdmin(id, req.body);
      res.status(200).json({ success: true, data: updatedAdmin });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update admin" });
    }
  } else if (method === "DELETE") {
    try {
      await deleteAdmin(id);
      res.status(204).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete admin" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res
      .status(405)
      .json({ success: false, error: `Method ${method} Not Allowed` });
  }
}
