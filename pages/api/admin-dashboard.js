import { getAllTicketsForAdmin, getEndUser, getSupportMembers } from "@/lib/db";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  const token = await getToken({ req, secret });
  const organization = token.organization;

  if (req.method === "GET") {
    try {
      const tickets = await getAllTicketsForAdmin(organization);
      const users = await getEndUser();
      const supportMembers = await getSupportMembers();

      const ticketStatusCounts = {
        New: tickets.filter((ticket) => ticket.status === "New").length,
        InProgress: tickets.filter((ticket) => ticket.status === "InProgress")
          .length,
        Completed: tickets.filter((ticket) => ticket.status === "Completed")
          .length,
        Closed: tickets.filter((ticket) => ticket.status === "Closed").length,
      };

      const ticketPriorityCounts = {
        High: tickets.filter((ticket) => ticket.priority === "High").length,
        Medium: tickets.filter((ticket) => ticket.priority === "Medium").length,
        Low: tickets.filter((ticket) => ticket.priority === "Low").length,
      };

      res.status(200).json({
        ticketStatusCounts,
        userCount: users.length,
        supportCount: supportMembers.length,
        ticketPriorityCounts,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin summary data" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
