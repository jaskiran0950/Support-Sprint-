import { getAllOrganizations, getAllAdmins, getAllContacts } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const organizations = await getAllOrganizations();
      const admins = await getAllAdmins();
      const contacts = await getAllContacts();

      const pendingContacts = contacts.filter(
        (contact) => contact.status === "Pending"
      ).length;
      const completedContacts = contacts.filter(
        (contact) => contact.status === "Completed"
      ).length;

      res.status(200).json({
        organizationCount: organizations.length,
        adminCount: admins.length,
        contactRequestCounts: {
          pending: pendingContacts,
          completed: completedContacts,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summary data" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
