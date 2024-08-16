import { getToken } from "next-auth/jwt";
import { getAllFAQs, createFAQ } from "@/lib/db";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handle(req, res) {
  const token = await getToken({ req, secret });

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const organizationId = token.organization;
  const userId = token.userId;

  if (req.method === "GET") {
    try {
      const faqs = await getAllFAQs(organizationId);
      res.status(200).json(faqs);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "POST") {
    if (token.role !== "Support") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { question, answer } = req.body;

    try {
      const faq = await createFAQ({ question, answer }, userId, organizationId);
      res.status(201).json(faq);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
