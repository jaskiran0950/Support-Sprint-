import { useEffect, useState } from "react";
import styles from "@/styles/contact-submission.module.css";
import AddUserModal from "@/components/add-user-modal";
import Pagination from "@/components/pagination";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("support");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/user");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const openModal = (user = null) => {
    setEditUserData(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditUserData(null);
  };

  const openDeleteModal = (id) => {
    setDeleteUserId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteUserId(null);
    setIsDeleteModalOpen(false);
  };

  const addNewUser = async (newUser) => {
    try {
      setUsers((prevUsers) => [...prevUsers, newUser]);
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`/api/user/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      toast.success("User deleted successfully!");
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user. Please try again.");
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

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.mobile.toLowerCase().includes(query)
    );
  });

  const supportUsers = filteredUsers.filter((user) => user.role === "Support");
  const endUsers = filteredUsers.filter((user) => user.role === "User");

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSupportUsers = supportUsers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const currentEndUsers = endUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleViewDetailsClick = (id) => {
    router.push(`/support-member-details?id=${id}`);
  };

  const renderUsersTable = (userList) => (
    <div>
      {userList.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user, index) => (
              <tr key={user.id}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.mobile}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className={styles.editButton}
                    onClick={() => openModal(user)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => openDeleteModal(user.id)}
                  >
                    Delete
                  </button>
                  {user.role === "Support" && (
                    <button
                      className={styles.viewDetailsButton}
                      onClick={() => handleViewDetailsClick(user.id)}
                    >
                      View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.noResults}>No Results Found</p>
      )}
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contactBox}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder={
              activeTab === "support"
                ? "Search support member..."
                : "Search end user..."
            }
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className={styles.searchInput}
          />
          <h4 className={styles.title}>Users</h4>
          <button
            className={styles.addOrganizationButton}
            onClick={() => openModal()}
          >
            Add User
          </button>
        </div>
        <AddUserModal
          isOpen={isModalOpen}
          closeModal={closeModal}
          addNewUser={addNewUser}
          updateUser={fetchUsers}
          editUserData={editUserData}
        />
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "support" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("support")}
          >
            Support Team
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "endUser" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("endUser")}
          >
            End Users
          </button>
        </div>
        <div>
          {activeTab === "support" && renderUsersTable(currentSupportUsers)}
          {activeTab === "endUser" && renderUsersTable(currentEndUsers)}
        </div>
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={
            activeTab === "support" ? supportUsers.length : endUsers.length
          }
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        style={customStyles}
        contentLabel="Confirm Delete"
      >
        <h4>Are you sure you want to delete this user?</h4>
        <div className={styles.buttonContainer}>
          <button
            className={styles.submitButton1}
            onClick={() => deleteUser(deleteUserId)}
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
    width: "50%",
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
