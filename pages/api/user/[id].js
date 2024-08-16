import { updateAdmin, deleteAdmin, getUserById } from "@/lib/db";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method === "PUT") {
    try {
      const updatedUser = await updateAdmin(id, req.body);
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update user" });
    }
  } else if (method === "DELETE") {
    try {
      await deleteAdmin(id);
      res.status(204).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete user" });
    }
  } else if (method === "GET") {
    try {
      const supportMember = await getUserById(id);
      if (!supportMember) {
        return res
          .status(404)
          .json({ success: false, error: "Support member not found" });
      }
      res.status(200).json({ success: true, data: supportMember });
    } catch (error) {
      console.error("Error fetching support member:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch support member" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE", "GET"]);
    res
      .status(405)
      .json({ success: false, error: `Method ${method} Not Allowed` });
  }
}
