import { getTicketById, updateTicketById } from "@/lib/db";
import sendMail from "@/utils/mail";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const {
      title,
      description,
      tags,
      message,
      status,
      priority,
      assigned_to,
      assignee_email,
    } = req.body;

    try {
      const currentTicket = await getTicketById(id);

      if (!currentTicket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      let data = {
        title,
        description,
        tags,
        message,
        status,
        priority,
        assigned_to,
      };

      if (currentTicket.status === "Closed" && status === "New") {
        data.reopen = currentTicket.reopen + 1;
      }

      const assignedToPrevious = currentTicket.assigned_to;

      const updatedTicket = await updateTicketById(id, data);

      if (assignedToPrevious !== assigned_to && assigned_to && assignee_email) {
        console.log("sending email");
        const mailOptions = {
          from: "ssprint01.help@gmail.com",
          to: assignee_email,
          subject: "New Ticket Assigned to You",
          text: `A new ticket has been assigned to you. Please check your dashboard for more details.`,
        };

        await sendMail(mailOptions);
      }

      res.status(200).json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ error: "Failed to update ticket" });
    }
  } else if (req.method === "GET") {
    try {
      const ticket = await getTicketById(id);
      if (ticket) {
        res.status(200).json(ticket);
      } else {
        res.status(404).json({ error: "Ticket not found" });
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
