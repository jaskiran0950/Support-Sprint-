import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/utils/constants";
import styles from "./tickets.module.css";
import Multiselect from "multiselect-react-dropdown";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import FeedbackForm from "@/components/feedback";
import { Rating } from "react-simple-star-rating";
import { getSession } from "next-auth/react";
import Loader from "@/components/loader";

const TicketDetails = () => {
  const { data: session } = useSession();
  const userRole = session?.user.role;
  const userId = session?.user?.userId;
  const router = useRouter();
  const { id } = router.query;
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToEmail, setAssignedToEmail] = useState("");
  const [supportMembers, setSupportMembers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    title: "",
    description: "",
    tags: "",
    message: "",
  });
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState(null);

  const formatStatus = (status) => {
    return status.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  useEffect(() => {
    if (userRole === UserRoles.Admin) {
      fetchSupportMembers();
    }
  }, [userRole]);

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`/api/ticket/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch ticket details");
      }
      const data = await response.json();
      setTicket(data);
      setStatus(data.status);
      setPriority(data.priority);
      setAssignedTo(data.assigned_to);

      setEditValues({
        title: data.title,
        description: data.description,
        tags: data.tags,
        message: data.message,
      });
      const tagsArray = data.tags.split(", ").map((tag) => ({ name: tag }));
      setSelectedCategories(tagsArray);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  };

  const fetchSupportMembers = async () => {
    try {
      const response = await fetch(`/api/support-members`);
      if (response.ok) {
        const data = await response.json();
        setSupportMembers(data);
      } else {
        throw new Error("Failed to fetch support members");
      }
    } catch (error) {
      console.error("Error fetching support members:", error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/tags");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleAssignChange = (e) => {
    setAssignedTo(e.target.value);

    const assigneeEmail = supportMembers.filter(
      (x) => x.id == e.target.value
    )?.[0].email;

    setAssignedToEmail(assigneeEmail);
  };

  const convertTagsToString = (tagsArray) => {
    return tagsArray.map((tag) => tag.name).join(", ");
  };

  const handleSaveChanges = async () => {
    try {
      const tagsString = convertTagsToString(selectedCategories);

      const response = await fetch(`/api/ticket/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editValues,
          tags: tagsString,
          status:
            userRole === UserRoles.Admin || userRole === UserRoles.Support
              ? status
              : ticket?.status,
          priority,
          assigned_to: assignedTo,
          assignee_email: assignedToEmail,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save changes");
      }
      const updatedTicket = await response.json();
      fetchTicketDetails();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleCloseTicket = async () => {
    try {
      const response = await fetch(`/api/ticket/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Closed" }),
      });
      if (!response.ok) {
        throw new Error("Failed to close ticket");
      }
      const updatedTicket = await response.json();
      setShowCloseModal(false);
      setIsEditing(false);
      fetchTicketDetails();
    } catch (error) {
      console.error("Error closing ticket:", error);
    }
  };

  const handleReopenTicket = async () => {
    try {
      const response = await fetch(`/api/ticket/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "New", reopen: ticket?.reopen + 1 }),
      });
      if (!response.ok) {
        throw new Error("Failed to reopen ticket");
      }
      const updatedTicket = await response.json();
      setShowReopenModal(false);
      setIsEditing(false);
      fetchTicketDetails();
    } catch (error) {
      console.error("Error reopening ticket:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
      fetchComments();
    }
  }, [id]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?id=${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      const res = await fetch(`/api/comments?id=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newComment }),
      });

      if (res.ok) {
        const addedComment = await res.json();
        setComments([addedComment, ...comments]);
        setNewComment("");
        fetchComments();
      } else {
        console.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId));
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  function getInitials(name) {
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return (
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      );
    } else {
      return nameParts[0].charAt(0).toUpperCase();
    }
  }

  const handleFeedbackSubmit = async (feedback) => {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          message: feedback.message,
          rating: feedback.rating,
        }),
      });

      setIsFeedbackOpen(false);
      await handleCloseTicket();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const closeTicket = async () => {
    if (userRole === "User") {
      setIsFeedbackOpen(true);
    } else {
      await handleCloseTicket();
    }
  };

  useEffect(() => {
    if (id && ticket?.status === "Closed") {
      fetchLatestFeedback();
    }
  }, [id, ticket?.status]);

  const fetchLatestFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback?ticket_id=${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          console.log(data[0]);
          setLatestFeedback(data[0]);
        }
      } else {
        throw new Error("Failed to fetch feedback");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handleAssignToMe = async () => {
    try {
      const response = await fetch(`/api/ticket/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigned_to: userId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to assign ticket to yourself");
      }
      const updatedTicket = await response.json();
      fetchTicketDetails();
    } catch (error) {
      console.error("Error assigning ticket to yourself:", error);
    }
  };

  return (
    <div className={styles.ticketDetailsContainer}>
      <div className={styles.mainContent}>
        <div className={styles.ticketHeader}>
          <div className={styles.ticketInfo}>
            {isEditing && userRole === UserRoles.User ? (
              <input
                type="text"
                name="title"
                value={editValues.title}
                onChange={handleInputChange}
                className={styles.editInput}
              />
            ) : (
              <strong>
                <h4>{ticket?.title}</h4>
              </strong>
            )}
            <strong>Raised By:</strong> {ticket?.created_by_id.name} <br></br>
            <strong>Created Date:</strong>{" "}
            {new Date(ticket?.created_at).toLocaleString()}
          </div>
          {status !== "Closed" && (
            <FaEdit
              className={styles.editIcon}
              onClick={() => setIsEditing(true)}
              style={{ display: isEditing ? "none" : "block" }}
            />
          )}
        </div>
        <div className={styles.ticketBody}>
          <p>
            <strong>Description:</strong>{" "}
            {isEditing && userRole === UserRoles.User ? (
              <textarea
                name="description"
                value={editValues.description}
                onChange={handleInputChange}
                className={styles.editTextarea}
                rows={3}
              />
            ) : (
              ticket?.description
            )}
          </p>
          <p>
            <strong>Category / Tags:</strong>
            {isEditing && userRole === UserRoles.User ? (
              <Multiselect
                options={categories}
                value={editValues.tags}
                selectedValues={selectedCategories}
                onSelect={(selectedList) => setSelectedCategories(selectedList)}
                onRemove={(selectedList) => setSelectedCategories(selectedList)}
                displayValue="name"
                style={{ multiselectContainer: { background: "white" } }}
              />
            ) : (
              ticket?.tags
            )}
          </p>
          <p>
            <strong>Message:</strong>{" "}
            {isEditing && userRole === UserRoles.User ? (
              <textarea
                name="message"
                value={editValues.message}
                onChange={handleInputChange}
                className={styles.editTextarea}
              />
            ) : (
              ticket?.message
            )}
          </p>
        </div>
        {!isEditing ? (
          <div className={styles.commentContainer}>
            {comments.length > 0 && (
              <div className={styles.commentBody}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentHeaderRow}>
                      <div className={styles.commentAuthor}>
                        <div className={styles.avatar}>
                          {comment.created_by_id?.name
                            ? getInitials(comment.created_by_id?.name)
                            : ""}
                        </div>
                        <div>
                          <span>{comment.created_by_id?.name}</span>{" "}
                          <span className={styles.commentDate}>
                            ({comment.created_by_id?.role})
                          </span>
                        </div>
                      </div>
                      <div className={styles.commentActions}>
                        <div className={styles.commentDate}>
                          {new Date(comment.created_at).toLocaleString(
                            undefined,
                            {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                          {console.log(
                            "userId:",
                            userId,
                            "comment.created_by:",
                            comment.created_by
                          )}

                          {userId === comment.created_by && (
                            <FaTrashAlt
                              className={styles.deleteCommentIcon}
                              onClick={() => handleDelete(comment.id)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <p className={styles.commentMessage}>{comment.message}</p>
                  </div>
                ))}
              </div>
            )}

            {status !== "Closed" && (
              <form onSubmit={handleAddComment}>
                <textarea
                  className={styles.messageInput}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment"
                  rows={3}
                ></textarea>
                <button className={styles.sendMessageButton} type="submit">
                  Add Comment
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className={styles.buttonContainer}>
            <button
              className={styles.saveMessageButton}
              onClick={handleSaveChanges}
            >
              Save
            </button>
            <button
              className={styles.closeTicketButton}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className={styles.sidebar}>
        <div className={styles.ticketControls}>
          <div className={styles.badges}>
            {((assignedTo && assignedTo !== "") ||
              (isEditing && userRole === UserRoles.Admin)) && (
              <p>
                <strong>Assigned to: </strong>
                {isEditing && userRole === UserRoles.Admin ? (
                  <select
                    value={assignedTo}
                    onChange={handleAssignChange}
                    className={styles.dropdown}
                  >
                    <option value="">Select a member</option>
                    {supportMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                ) : ticket?.assigned_to_id ? (
                  ticket?.assigned_to_id.name
                ) : (
                  ""
                )}
              </p>
            )}
            {isEditing &&
              userRole === UserRoles.Support &&
              !ticket?.assigned_to && (
                <div className={styles.editFormSection}>
                  <button
                    className={styles.reopenTicketButton}
                    onClick={handleAssignToMe}
                  >
                    Assign to Me
                  </button>
                </div>
              )}
            {((priority && priority !== "") ||
              (isEditing &&
                (userRole === UserRoles.Admin ||
                  userRole === UserRoles.Support))) && (
              <p>
                <strong>Priority: </strong>
                {isEditing &&
                (userRole === UserRoles.Admin ||
                  userRole === UserRoles.Support) ? (
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={styles.dropdown}
                  >
                    <option value="" disabled selected>
                      Choose Priority
                    </option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span
                    className={`${styles.badge} ${styles[`badge${priority}`]}`}
                  >
                    {priority}
                  </span>
                )}
              </p>
            )}
            {(status || isEditing) && (
              <p>
                <strong>Status: </strong>
                {isEditing &&
                (userRole === UserRoles.Admin ||
                  userRole === UserRoles.Support) ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={styles.dropdown}
                  >
                    <option value="New">New</option>
                    <option value="InProgress">In Progress</option>
                  </select>
                ) : (
                  <span
                    className={`${styles.badge} ${
                      styles[`badge${status.replace(" ", "")}`]
                    }`}
                  >
                    {formatStatus(status)}
                  </span>
                )}
              </p>
            )}
          </div>

          <div className={styles.buttonContainer}>
            {status !== "Closed" ? (
              <button
                className={styles.closeTicketButton}
                onClick={() => setShowCloseModal(true)}
              >
                Close Ticket
              </button>
            ) : (
              <button
                className={styles.reopenTicketButton}
                onClick={() => setShowReopenModal(true)}
              >
                Reopen Ticket
              </button>
            )}
          </div>
          {status === "Closed" &&
            userRole === UserRoles.Support &&
            latestFeedback && (
              <div className={styles.feedbackContainer}>
                <h6>
                  {" "}
                  <strong>Your Feedback </strong>
                </h6>
                <div className={styles.feedback}>
                  <p>
                    <Rating
                      initialValue={latestFeedback.rating}
                      size={40}
                      readonly
                      activeColor="#ffd700"
                    />
                  </p>

                  {latestFeedback.message && (
                    <p>
                      {" "}
                      <h6>
                        {" "}
                        <strong>Feedback:</strong> {latestFeedback.message}{" "}
                      </h6>
                    </p>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
      {showCloseModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h4>Are you sure you want to close the ticket?</h4>
            <div className={styles.modalButtons}>
              <button className={styles.confirmButton} onClick={closeTicket}>
                Confirm
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowCloseModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isFeedbackOpen && (
        <FeedbackForm
          onSubmit={handleFeedbackSubmit}
          onClose={() => setIsFeedbackOpen(false)}
        />
      )}
      {showReopenModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h4>Are you sure you want to reopen the ticket?</h4>
            <div className={styles.modalButtons}>
              <button
                className={styles.confirmButton}
                onClick={handleReopenTicket}
              >
                Confirm
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowReopenModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}

export default TicketDetails;
