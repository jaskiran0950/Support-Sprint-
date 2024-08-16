import {
  addTicket,
  getAllTicketsForAdmin,
  getTicketsForUser,
  getAdminEmailForOrganization,
  getTicketsForSupport,
} from "@/lib/db";
import { getToken } from "next-auth/jwt";
import sendMail from "@/utils/mail";
import { UserRoles } from "@/utils/constants";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  const token = await getToken({ req, secret });
  const userId = token.userId;
  const organization = token.organization;
  const role = token.role;

  if (req.method === "POST") {
    try {
      let payload = JSON.parse(req.body);
      payload.created_by = userId;
      payload.updated_by = userId;
      payload.organization_id = organization;

      const result = await addTicket(payload);

      const adminEmail = await getAdminEmailForOrganization(organization);
      if (!adminEmail) {
        throw new Error("Admin email not found");
      }

      const mailOptions = {
        from: "ssprint01.help@gmail.com",
        to: adminEmail,
        subject: "New Ticket Raised.",
        text: `A new ticket has been created with the following details:\n\nTitle: ${payload.title}\nDescription: ${payload.description}\nCategory: ${payload.category}\nMessage: ${payload.message}`,
      };

      await sendMail(mailOptions);

      res.status(200).json({ message: "Ticket submitted successfully" });
    } catch (error) {
      console.error("Error submitting ticket:", error);
      res.status(500).json({ error: "Failed to submit ticket" });
    }
  } else if (req.method === "GET") {
    try {
      let tickets;

      if (role === UserRoles.Admin) {
        tickets = await getAllTicketsForAdmin(organization);
      } else if (role === UserRoles.Support) {
        tickets = await getTicketsForSupport(userId, organization);
      } else {
        tickets = await getTicketsForUser(userId, organization);
      }

      res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch tickets" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res
      .status(405)
      .json({ success: false, error: `Method ${req.method} Not Allowed` });
  }
}
