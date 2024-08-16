import { getSupportMemberStats } from "@/lib/db";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "GET") {
    const { supportMemberId } = req.query;

    try {
      const stats = await getSupportMemberStats(supportMemberId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch stats" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res
      .status(405)
      .json({ success: false, error: `Method ${method} Not Allowed` });
  }
}
