import { createOrUpdateFeedback, getFeedbackByTicketId } from "@/lib/db";
import { getToken } from "next-auth/jwt";
const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handle(req, res) {
  const token = await getToken({ req, secret });

  if (req.method === "POST") {
    const { rating, message, ticket_id } = req.body;

    const created_by = token?.userId;

    try {
      const feedback = await createOrUpdateFeedback({
        rating,
        message,
        ticket_id,
        created_by,
      });
      res.status(200).json(feedback);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "GET") {
    const { ticket_id } = req.query;

    try {
      const feedback = await getFeedbackByTicketId(ticket_id);
      res.status(200).json(feedback);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
