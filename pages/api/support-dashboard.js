import { getToken } from "next-auth/jwt";
import {
  getTotalTicketsForOrganization,
  getAssignedTickets,
  getInProgressTickets,
  getClosedTickets,
} from "@/lib/db";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = token.userId;
    const organization = token.organization;
    const totalTickets = await getTotalTicketsForOrganization(organization);
    const assignedTickets = await getAssignedTickets(userId);
    const inProgressTickets = await getInProgressTickets(userId);
    const closedTickets = await getClosedTickets(userId);

    res.status(200).json({
      totalTickets,
      assignedTickets,
      inProgressTickets,
      closedTickets,
    });
  } catch (error) {
    console.error("Failed to fetch support dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch support dashboard data" });
  }
}
