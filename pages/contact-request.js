import React, { useState, useEffect } from "react";
import styles from "@/styles/contact-submission.module.css";
import Pagination from "@/components/pagination";
import { getSession } from "next-auth/react";

export default function ContactUsPage() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetch("/api/contact-submission")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setContacts(data);
        } else {
          console.error("Data fetched is not an array:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const getStatusBadge = (status) => {
    const badgeClass =
      status === "Pending"
        ? styles["badge-pending"]
        : styles["badge-completed"];
    return <span className={`${styles.badge} ${badgeClass}`}>{status}</span>;
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.organization.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredContacts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contactBox}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder="Search Contact Request..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className={styles.searchInput}
          />
          <h4 className={styles.title}>Contact Requests</h4>
        </div>
        {currentItems.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Organization</th>
                <th>Message</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((contact, index) => (
                <tr key={contact.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
                  <td>{contact.address}</td>
                  <td>{contact.organization}</td>
                  <td>{contact.message}</td>
                  <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                  <td>{new Date(contact.created_at).toLocaleTimeString()}</td>
                  <td>{getStatusBadge(contact.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.noResults}>No Results Found</p>
        )}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredContacts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}

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
