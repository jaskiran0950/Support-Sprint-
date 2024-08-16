import { getToken } from "next-auth/jwt";
import {
  addComment,
  getCommentsForTicket,
  getTicketById,
  getUserById,
  getSupportMemberById,
} from "@/lib/db";
import sendMail from "@/utils/mail";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  const token = await getToken({ req, secret });
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const comments = await getCommentsForTicket(id);
      res.status(200).json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  } else if (req.method === "POST") {
    try {
      const { message } = req.body;
      const userId = token.userId;
      const userRole = token.role;

      const newComment = await addComment({
        ticket_id: id,
        created_by: userId,
        message,
      });

      const ticket = await getTicketById(id);

      if (userRole === "User") {
        const supportMember = await getSupportMemberById(ticket.assigned_to);
        if (supportMember && supportMember.email) {
          await sendMail({
            from: "ssprint01.help@gmail.com",
            to: supportMember.email,
            subject: "New Comment on Ticket",
            text: `A new comment has been added to ticket #${id}: ${message}`,
          });
        }
      } else if (userRole === "Support") {
        const user = await getUserById(ticket.created_by);
        if (user && user.email) {
          await sendMail({
            from: "ssprint01.help@gmail.com",
            to: user.email,
            subject: "New Comment on Your Ticket",
            text: `A new comment has been added to your ticket: ${message}`,
          });
        }
      } else if (userRole === "Admin") {
        const user = await getUserById(ticket.created_by);
        const supportMember = await getSupportMemberById(ticket.assigned_to);

        const recipients = [user.email, supportMember.email]
          .filter(Boolean)
          .join(",");

        if (recipients) {
          await sendMail({
            from: "ssprint01.help@gmail.com",
            to: recipients,
            subject: "New Comment on Ticket",
            text: `A new comment has been added to ticket #${id}: ${message}`,
          });
        }
      }

      res.status(200).json({
        ...newComment,
        user: {
          id: token.userId,
          name: token.name,
          role: token.role,
        },
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Failed to add comment" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
