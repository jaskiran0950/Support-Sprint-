import { useEffect, useState } from "react";
import styles from "@/styles/contact-submission.module.css";
import AddAdminModal from "@/components/add-admin-modal";
import Pagination from "@/components/pagination";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { getSession } from "next-auth/react";

export default function AdminPage() {
  const [admins, setAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAdminData, setEditAdminData] = useState(null);
  const [deleteAdminId, setDeleteAdminId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin");
      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }
      const data = await response.json();
      setAdmins(data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const openModal = (admin = null) => {
    setEditAdminData(admin);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditAdminData(null);
  };

  const openDeleteModal = (id) => {
    setDeleteAdminId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteAdminId(null);
    setIsDeleteModalOpen(false);
  };

  const addNewAdmin = async (newAdmin) => {
    try {
      setAdmins((prevAdmins) => [...prevAdmins, newAdmin]);
      fetchAdmins();
      closeModal();
    } catch (error) {
      console.error("Failed to add admin:", error);
    }
  };

  const deleteAdmin = async (id) => {
    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete admin");
      }
      setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== id));
      toast.success("Admin deleted successfully!");
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete admin:", error);
      toast.error("Failed to delete admin. Please try again.");
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

  const filteredAdmins = admins.filter((admin) => {
    const query = searchQuery.toLowerCase();
    return (
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      admin.mobile.toLowerCase().includes(query) ||
      admin?.organization.name.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contactBox}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder="Search Admin..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className={styles.searchInput}
          />
          <h4 className={styles.title}>Admins</h4>
          <button
            className={styles.addOrganizationButton}
            onClick={() => openModal()}
          >
            Add Admin
          </button>
        </div>
        <AddAdminModal
          isOpen={isModalOpen}
          closeModal={closeModal}
          addNewAdmin={addNewAdmin}
          updateAdmin={fetchAdmins}
          editAdminData={editAdminData}
        />
        {currentItems.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Organization</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((admin, index) => (
                <tr key={admin.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.mobile}</td>
                  <td>{admin.organization.name}</td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => openModal(admin)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => openDeleteModal(admin.id)}
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
          totalItems={filteredAdmins.length}
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
        <h4>Are you sure you want to delete this admin?</h4>
        <div className={styles.buttonContainer}>
          <button
            className={styles.submitButton1}
            onClick={() => deleteAdmin(deleteAdminId)}
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
