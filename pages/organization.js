import { useEffect, useState } from "react";
import styles from "@/styles/contact-submission.module.css";
import AddOrganizationModal from "@/components/add-organization-modal";
import toast from "react-hot-toast";
import Modal from "react-modal";
import Pagination from "@/components/pagination";
import { getSession } from "next-auth/react";

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editOrganizationData, setEditOrganizationData] = useState(null);
  const [deleteOrgId, setDeleteOrgId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organization");
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      const data = await response.json();
      if (data.success) {
        setOrganizations(data.data);
      } else {
        console.error("Failed to fetch organizations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const openModal = (organization = null) => {
    setEditOrganizationData(organization);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditOrganizationData(null);
  };

  const openDeleteModal = (id) => {
    setDeleteOrgId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteOrgId(null);
    setIsDeleteModalOpen(false);
  };

  const addNewOrganization = async (newOrganization) => {
    setOrganizations((prevOrganizations) => [
      ...prevOrganizations,
      newOrganization,
    ]);
    fetchOrganizations();
  };

  const updateOrganization = async () => {
    fetchOrganizations();
  };

  const deleteOrganization = async (id) => {
    try {
      const response = await fetch(`/api/organization/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete organization");
      }
      setOrganizations((prevOrganizations) =>
        prevOrganizations.filter((org) => org.id !== id)
      );
      toast.success("Organization deleted successfully!");
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete organization:", error);
      toast.error("Failed to delete organization. Please try again.");
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

  const filteredOrganizations = organizations.filter((organization) => {
    const query = searchQuery.toLowerCase();
    return (
      organization.name.toLowerCase().includes(query) ||
      organization.email.toLowerCase().includes(query) ||
      organization.phone.toLowerCase().includes(query) ||
      organization.address.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrganizations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contactBox}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder="Search Organization..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className={styles.searchInput}
          />
          <h4 className={styles.title}>Organizations</h4>
          <button
            className={styles.addOrganizationButton}
            onClick={() => openModal()}
          >
            Add Organization
          </button>
        </div>
        <AddOrganizationModal
          isOpen={isModalOpen}
          closeModal={closeModal}
          addNewOrganization={addNewOrganization}
          updateOrganization={updateOrganization}
          editOrganizationData={editOrganizationData}
        />
        {currentItems.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((org, index) => (
                <tr key={org.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{org.name}</td>
                  <td>{org.email}</td>
                  <td>{org.phone}</td>
                  <td>{org.address}</td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => openModal(org)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => openDeleteModal(org.id)}
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
          currentPage={currentPage}
          totalItems={filteredOrganizations.length}
          itemsPerPage={itemsPerPage}
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
        <h4>Are you sure you want to delete this organization?</h4>
        <div className={styles.buttonContainer}>
          <button
            className={styles.submitButton1}
            onClick={() => deleteOrganization(deleteOrgId)}
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
