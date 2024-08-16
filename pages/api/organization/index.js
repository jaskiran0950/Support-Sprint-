import {
  getAllOrganizations,
  addOrganization,
  findOrganization,
  findContactByEmail,
  updateContactByEmail,
} from "@/lib/db";
import { ContactStatus } from "@/utils/constants";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "POST") {
    const { name, email, phone, address } = req.body;
    try {
      const existingOrganization = await findOrganization(email);
      if (existingOrganization) {
        return res
          .status(400)
          .json({ success: false, error: "Email already exists" });
      }

      const newOrganization = await addOrganization({
        name,
        email,
        phone,
        address,
      });

      const contact = await findContactByEmail(email);
      if (contact) {
        await updateContactByEmail({
          ...contact,
          status: ContactStatus.Completed,
        });
      }

      res.status(201).json({ success: true, data: newOrganization });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, error: "Failed to add organization" });
    }
  } else if (method === "GET") {
    try {
      const organizations = await getAllOrganizations();
      res.status(200).json({ success: true, data: organizations });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch organizations" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res
      .status(405)
      .json({ success: false, error: `Method ${method} Not Allowed` });
  }
}
