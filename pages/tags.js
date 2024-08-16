import { useEffect, useState } from "react";
import styles from "@/styles/contact-submission.module.css";
import Pagination from "@/components/pagination";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { getSession } from "next-auth/react";
import AddTagModal from "@/components/add-tag-modal";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTagData, setEditTagData] = useState(null);
  const [deleteTagId, setDeleteTagId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const openModal = (tag = null) => {
    setEditTagData(tag);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditTagData(null);
  };

  const openDeleteModal = (id) => {
    setDeleteTagId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteTagId(null);
    setIsDeleteModalOpen(false);
  };

  const addNewTag = async (newTag) => {
    try {
      setTags((prevTags) => [...prevTags, newTag]);
      fetchTags();
      closeModal();
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  const deleteTag = async (id) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete tag");
      }
      setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
      toast.success("Tag deleted successfully!");
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      toast.error("Failed to delete tag. Please try again.");
    }
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to the first page
  };

  const filteredTags = tags.filter((tag) => {
    const query = searchQuery.toLowerCase();
    return tag.name.toLowerCase().includes(query);
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTags.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contactBox}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder="Search Tags..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className={styles.searchInput}
          />
          <h4 className={styles.title}>Tags</h4>
          <button
            className={styles.addOrganizationButton}
            onClick={() => openModal()}
          >
            Add Tag
          </button>
        </div>
        <AddTagModal
          isOpen={isModalOpen}
          closeModal={closeModal}
          addNewTag={addNewTag}
          updateTag={fetchTags}
          editTagData={editTagData}
        />
        {currentItems.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((tag, index) => (
                <tr key={tag.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{tag.name}</td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => openModal(tag)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => openDeleteModal(tag.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.noResults}>No Results Found</p>
        )}
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={filteredTags.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange} // Add this prop
        />
      </div>
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        style={customStyles}
        contentLabel="Confirm Delete"
      >
        <h4>Are you sure you want to delete this tag?</h4>
        <div className={styles.buttonContainer}>
          <button
            className={styles.submitButton1}
            onClick={() => deleteTag(deleteTagId)}
          >
            Yes
          </button>
          <button className={styles.submitButton2} onClick={closeDeleteModal}>
            No
          </button>
        </div>
      </Modal>
    </div>
  );
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    width: "41%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
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
