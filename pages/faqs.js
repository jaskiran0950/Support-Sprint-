import { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import { useCollapse } from "react-collapsed";
import Modal from "react-modal";
import styles from "@/styles/faqs.module.css";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { UserRoles } from "@/utils/constants";

const FAQs = () => {
  const { data: session } = useSession();
  const [faqs, setFaqs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editFaqId, setEditFaqId] = useState(null);
  const [deleteFaqId, setDeleteFaqId] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch("/api/faqs");
      if (!response.ok) {
        throw new Error("Failed to fetch FAQs");
      }
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  const handleAddFAQ = async (event) => {
    event.preventDefault();
    const method = editFaqId ? "PUT" : "POST";
    const url = editFaqId ? `/api/faqs/${editFaqId}` : "/api/faqs";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, answer }),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${editFaqId ? "update" : "add"} FAQ`);
      }
      fetchFaqs();
      closeModal();
    } catch (error) {
      console.error(`Failed to ${editFaqId ? "update" : "add"} FAQ:`, error);
    }
  };

  const handleEditFAQ = (faq) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditFaqId(faq.id);
    setIsModalOpen(true);
  };

  const openConfirmModal = (id) => {
    setDeleteFaqId(id);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setDeleteFaqId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/faqs/${deleteFaqId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete FAQ");
      }
      fetchFaqs();
      closeConfirmModal();
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQuestion("");
    setAnswer("");
    setEditFaqId(null);
  };

  return (
    <div className={styles.faqBox}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h4>
              <strong>FAQs</strong>
            </h4>
          </div>
          <div className={styles.headerActions}>
            {session?.user.role === UserRoles.Support && (
              <button
                className={`${styles.addButton} ${styles.headerButton}`}
                onClick={() => setIsModalOpen(true)}
              >
                Add FAQ
              </button>
            )}
          </div>
        </div>
        {Array.isArray(faqs) &&
          faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              onEdit={handleEditFAQ}
              onDelete={openConfirmModal}
            />
          ))}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Add FAQ"
          className={styles.modal}
          overlayClassName={styles.overlay}
        >
          <div className={styles.modalContent}>
            <h4 className={styles.title}>
              <strong>{editFaqId ? "Edit FAQ" : "Add FAQ"}</strong>
            </h4>
            <form onSubmit={handleAddFAQ}>
              <label className={styles.formLabel}>
                Question:
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className={styles.inputField}
                  required
                />
              </label>
              <label className={styles.formLabel}>
                Answer:
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className={styles.textareaField}
                  required
                  rows={4}
                />
              </label>
              <div className={styles.buttonContainer}>
                <button type="submit" className={styles.addButton}>
                  {editFaqId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>
        <Modal
          isOpen={isConfirmModalOpen}
          onRequestClose={closeConfirmModal}
          contentLabel="Confirm Delete"
          className={styles.confirmModal}
          overlayClassName={styles.overlay}
        >
          <div className={styles.modalContent}>
            <h5>Are you sure you want to delete this FAQ?</h5>
            <div className={styles.buttonContainer}>
              <button
                onClick={handleConfirmDelete}
                className={styles.addButton}
              >
                Yes, Delete
              </button>
              <button
                onClick={closeConfirmModal}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

const FAQItem = ({ faq, onEdit, onDelete }) => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
  const { data: session } = useSession();

  return (
    <div className={styles.faq}>
      <h5 className={styles.que} {...getToggleProps()}>
        {faq.question}
        <div className={styles.actions}>
          {session?.user.role === UserRoles.Support && (
            <>
              <FaEdit onClick={() => onEdit(faq)} className={styles.editIcon} />
              <FaTrashAlt
                onClick={() => onDelete(faq.id)}
                className={styles.deleteIcon}
              />
            </>
          )}
          <span className={`${styles.icon} ${isExpanded ? "expanded" : ""}`}>
            {isExpanded ? "-" : "+"}
          </span>
        </div>
      </h5>
      <div {...getCollapseProps()}>
        <p className={`${styles.ans} ${isExpanded ? "is-expanded" : ""}`}>
          {faq.answer}
        </p>
      </div>
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

export default FAQs;
