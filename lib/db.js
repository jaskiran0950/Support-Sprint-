import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./auth";

const prisma = new PrismaClient();

export async function findUser(email) {
  try {
    const userdata = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });
    return userdata;
  } catch (err) {
    console.log(err);
  }
}

export async function addTicket(payload) {
  try {
    const result = await prisma.ticket.create({
      data: payload,
    });

    return result;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to add ticket");
  }
}

export async function getAllTags(organizationId) {
  try {
    const tags = await prisma.tags.findMany({
      where: { organization_id: organizationId },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });
    return tags;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch tags");
  }
}

export async function submitContactFormData(formData) {
  try {
    const existingContact = await prisma.contact_us.findUnique({
      where: {
        email: formData.email,
      },
    });
    if (existingContact) {
      throw new Error("Contact request already sent from this email.");
    }

    const result = await prisma.contact_us.create({
      data: formData,
    });
    return result;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

export async function ForgotPassword(email, otp) {
  try {
    const result = await prisma.forgot_password.create({
      data: {
        email,
        otp,
      },
    });
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed");
  }
}

export async function VerifyOTP(email, otp) {
  try {
    const otpRecord = await prisma.forgot_password.findFirst({
      where: {
        email: email,
        otp: otp,
      },
    });
    return otpRecord;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function ResetPassword(email, newPassword) {
  try {
    const encryptedPass = await hashPassword(newPassword);

    return await prisma.users.update({
      where: { email: email },
      data: { password: encryptedPass },
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getAllContacts() {
  try {
    const contacts = await prisma.contact_us.findMany();
    return contacts;
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    throw new Error("Failed to fetch contacts");
  }
}

export async function getAllOrganizations() {
  try {
    const Organizations = await prisma.organization.findMany();
    return Organizations;
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
}

export const addOrganization = async (data) => {
  return await prisma.organization.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
    },
  });
};

export const updateOrganization = async (id, data) => {
  return prisma.organization.update({
    where: { id: id },
    data,
  });
};

export const deleteOrganization = async (id) => {
  console.log("inside db function with id");
  console.log(id);
  return prisma.organization.delete({
    where: { id: id },
  });
};

export async function getAllAdmins() {
  try {
    const admins = await prisma.users.findMany({
      where: {
        role: "Admin",
        isActive: true,
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });
    return admins;
  } catch (error) {
    console.error("Failed to fetch admins:", error);
    throw new Error("Failed to fetch admins");
  }
}

export async function addAdmin(data) {
  return await prisma.users.create({
    data,
  });
}

export const updateAdmin = async (id, data) => {
  return prisma.users.update({
    where: { id: id },
    data,
  });
};

export const deleteAdmin = async (id) => {
  return prisma.users.delete({
    where: { id: id },
  });
};

export async function findOrganization(email) {
  try {
    console.log("email");
    console.log(email);
    const organizationdata = await prisma.organization.findUnique({
      where: {
        email: email,
      },
    });
    return organizationdata;
  } catch (err) {
    console.log(err);
  }
}

export async function getTicketById(id) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        created_by_id: {
          select: {
            name: true,
            email: true,
          },
        },
        assigned_to_id: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return ticket;
  } catch (error) {
    console.error("Failed to fetch ticket:", error);
    throw new Error("Failed to fetch ticket");
  }
}

export async function getUserById(id) {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user");
  }
}

export async function updateUserById(userId, newData) {
  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name: newData.name,
        mobile: newData.mobile,
      },
    });

    return updatedUser;
  } catch (error) {
    throw error;
  }
}

export async function updateUserPassword(userId, hashedPassword) {
  return await prisma.users.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export default prisma;

export async function findContactByEmail(email) {
  try {
    const contact = await prisma.contact_us.findUnique({
      where: { email: email },
    });

    return contact;
  } catch (error) {
    throw new Error(`Failed to fetch contact by email: ${error.message}`);
  }
}

export async function updateContactByEmail(data) {
  try {
    const updatedContact = await prisma.contact_us.update({
      where: { id: data.id },
      data,
    });
    return updatedContact;
  } catch (error) {
    throw new Error(`Failed to update contact: ${error.message}`);
  }
}

export const getAllUsers = async (organization_id) => {
  try {
    const users = await prisma.users.findMany({
      where: {
        organization_id: organization_id,
        role: {
          in: ["Support", "User"],
        },
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
};

export async function getAllTicketsForAdmin(organization) {
  return await prisma.ticket.findMany({
    orderBy: { created_at: "desc" },
    where: {
      organization_id: organization,
    },
  });
}

export async function getTicketsForUser(userId, organization) {
  return await prisma.ticket.findMany({
    orderBy: { created_at: "desc" },
    where: {
      created_by: userId,
      organization_id: organization,
    },
  });
}

export async function getTicketsForSupport(userId, organization) {
  return await prisma.ticket.findMany({
    orderBy: { created_at: "desc" },
    where: {
      organization_id: organization,
      OR: [{ assigned_to: userId }, { assigned_to: null }],
    },
    include: {
      assigned_to_id: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function storeSentEmail(mailOptions) {
  try {
    const result = await prisma.mails.create({
      data: {
        subject: mailOptions.subject,
        to: mailOptions.to,
        from: mailOptions.from,
        message: mailOptions.text,
      },
    });

    return result;
  } catch (error) {
    console.error("Error storing sent email:", error);
    throw new Error("Failed to store sent email");
  }
}

export const updateTicketById = async (id, data) => {
  try {
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data,
    });

    return updatedTicket;
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw error;
  }
};

export async function getAdminEmailForOrganization(organizationId) {
  try {
    const admin = await prisma.users.findFirst({
      where: {
        organization_id: organizationId,
        role: "Admin",
        isActive: true,
      },
      select: {
        email: true,
      },
    });
    return admin ? admin.email : null;
  } catch (error) {
    console.error("Failed to fetch admin email:", error);
    throw new Error("Failed to fetch admin email");
  }
}

export async function getSupportMembers(organization_id) {
  try {
    const supportMembers = await prisma.users.findMany({
      where: {
        organization_id: organization_id,
        role: "Support",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return supportMembers;
  } catch (error) {
    throw new Error("Failed to fetch support members");
  }
}

export async function getEndUser(organization_id) {
  try {
    const supportMembers = await prisma.users.findMany({
      where: {
        organization_id: organization_id,
        role: "User",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return supportMembers;
  } catch (error) {
    throw new Error("Failed to fetch support members");
  }
}

export async function addComment({ ticket_id, created_by, message }) {
  try {
    const newComment = await prisma.comments.create({
      data: {
        ticket_id,
        created_by,
        message,
      },
    });
    return newComment;
  } catch (error) {
    throw new Error("Failed to add comment");
  }
}

export async function getCommentsForTicket(ticket_id) {
  try {
    const comments = await prisma.comments.findMany({
      where: { ticket_id },
      orderBy: { created_at: "desc" },
      include: {
        created_by_id: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });
    return comments;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch comments");
  }
}

export const deleteComment = async (commentId, userId) => {
  try {
    const comment = await prisma.comments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.created_by !== userId) {
      throw new Error("Unauthorized");
    }

    await prisma.comments.delete({
      where: { id: commentId },
    });

    return { message: "Comment deleted successfully" };
  } catch (error) {
    throw new Error(error.message || "Error deleting comment");
  }
};

export const getSupportMemberById = async (id) => {
  try {
    const supportMember = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    return supportMember;
  } catch (error) {
    console.error("Error fetching support member:", error);
    throw error;
  }
};

export async function createOrUpdateFeedback({
  rating,
  message,
  ticket_id,
  created_by,
}) {
  try {
    const existingFeedback = await prisma.feedbacks.findFirst({
      where: { ticket_id },
    });

    if (existingFeedback) {
      const updatedFeedback = await prisma.feedbacks.update({
        where: { id: existingFeedback.id },
        data: { rating, message, created_by },
      });
      return updatedFeedback;
    } else {
      const newFeedback = await prisma.feedbacks.create({
        data: { rating, message, ticket_id, created_by },
      });
      return newFeedback;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create or update feedback");
  }
}

export async function getFeedbackByTicketId(ticket_id) {
  try {
    const feedback = await prisma.feedbacks.findMany({
      where: { ticket_id },
      orderBy: {
        created_at: "desc",
      },
    });
    return feedback;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch feedback");
  }
}

export async function getAllFAQs(organizationId) {
  try {
    const faqs = await prisma.faq.findMany({
      where: { organization_id: organizationId },
      orderBy: { created_at: "desc" },
    });
    return faqs;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch FAQs");
  }
}

export async function createFAQ(data, createdBy, organizationId) {
  try {
    const faq = await prisma.faq.create({
      data: {
        ...data,
        created_by: createdBy,
        updated_by: createdBy,
        organization_id: organizationId,
      },
    });
    return faq;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create FAQ");
  }
}

export async function updateFAQ(id, data) {
  try {
    const updatedFAQ = await prisma.faq.update({
      where: { id },
      data,
    });
    return updatedFAQ;
  } catch (error) {
    console.error("Error updating FAQ:", error);
    throw error;
  }
}

export async function deleteFAQ(id) {
  try {
    await prisma.faq.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    throw error;
  }
}

export async function getUserTicketsCount(userId) {
  try {
    const totalTickets = await prisma.ticket.count({
      where: { created_by: userId },
    });

    const unassignedTickets = await prisma.ticket.count({
      where: { created_by: userId, assigned_to: null },
    });

    const inProgressTickets = await prisma.ticket.count({
      where: { created_by: userId, status: "InProgress" },
    });

    const closedTickets = await prisma.ticket.count({
      where: { created_by: userId, status: "Closed" },
    });

    return {
      totalTickets,
      unassignedTickets,
      inProgressTickets,
      closedTickets,
    };
  } catch (error) {
    console.error("Failed to fetch user tickets count:", error);
    throw new Error("Failed to fetch user tickets count");
  }
}

export async function getTotalTicketsForOrganization(organizationId) {
  try {
    const totalTickets = await prisma.ticket.count({
      where: {
        organization_id: organizationId,
      },
    });
    return totalTickets;
  } catch (error) {
    console.error("Failed to fetch total tickets for organization:", error);
    throw new Error("Failed to fetch total tickets for organization");
  }
}

export async function getAssignedTickets(userId) {
  try {
    const assignedTickets = await prisma.ticket.count({
      where: {
        assigned_to: userId,
      },
    });
    return assignedTickets;
  } catch (error) {
    console.error("Failed to fetch assigned tickets:", error);
    throw new Error("Failed to fetch assigned tickets");
  }
}

export async function getInProgressTickets(userId) {
  try {
    const inProgressTickets = await prisma.ticket.count({
      where: {
        assigned_to: userId,
        status: "InProgress",
      },
    });
    return inProgressTickets;
  } catch (error) {
    console.error("Failed to fetch in-progress tickets:", error);
    throw new Error("Failed to fetch in-progress tickets");
  }
}

export async function getClosedTickets(userId) {
  try {
    const closedTickets = await prisma.ticket.count({
      where: {
        assigned_to: userId,
        status: "Closed",
      },
    });
    return closedTickets;
  } catch (error) {
    console.error("Failed to fetch closed tickets:", error);
    throw new Error("Failed to fetch closed tickets");
  }
}

export async function createTag(data) {
  return await prisma.tags.create({
    data,
  });
}

export async function updateTag(id, data) {
  return await prisma.tags.update({
    where: { id: Number(id) },
    data,
  });
}

export async function deleteTag(id) {
  return await prisma.tags.delete({
    where: { id: Number(id) },
  });
}

export async function getSupportMemberStats(supportMemberId) {
  try {
    const totalTickets = await prisma.ticket.count({
      where: {
        assigned_to: supportMemberId,
      },
    });

    const avgRating = await prisma.feedbacks.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        ticket: {
          assigned_to: supportMemberId,
        },
      },
    });

    const newTickets = await prisma.ticket.count({
      where: {
        assigned_to: supportMemberId,
        status: "New",
      },
    });

    const inProgressTickets = await prisma.ticket.count({
      where: {
        assigned_to: supportMemberId,
        status: "InProgress",
      },
    });

    const closedTickets = await prisma.ticket.count({
      where: {
        assigned_to: supportMemberId,
        status: "Closed",
      },
    });

    const feedbacks = await prisma.feedbacks.findMany({
      where: {
        ticket: {
          assigned_to: supportMemberId,
        },
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        message: true,
      },
      take: 5,
    });

    return {
      totalTickets,
      avgRating: avgRating._avg.rating,
      newTickets,
      inProgressTickets,
      closedTickets,
      feedbacks: feedbacks || [],
    };
  } catch (error) {
    console.error("Failed to fetch support member stats:", error);
    throw new Error("Failed to fetch support member stats");
  }
}
