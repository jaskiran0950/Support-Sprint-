import { submitContactFormData } from "@/lib/db";
import sendMail from "@/utils/mail";

const secret = process.env.NEXT_PUBLIC_SECRET;

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      console.log(req.body);
      let formData = req.body;
      await submitContactFormData(formData);

      const mailOptions = {
        from: "ssprint01.help@gmail.com",
        to: "ssprint01.help@gmail.com",
        subject: "New Contact Us Form Submission",
        text: `
            Name: ${formData.name}
            Email: ${formData.email}
            Phone: ${formData.phone}
            Address: ${formData.address}
            Organization: ${formData.organization}
            Message: ${formData.message}
          `,
      };

      await sendMail(mailOptions);

      res
        .status(200)
        .json({ success: true, message: "Form submitted successfully" });
    } catch (error) {
      if (error.message === "Contact request already sent from this email.") {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Error submitting form:", error);
        res.status(500).json({ error: "Failed to submit form" });
      }
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
