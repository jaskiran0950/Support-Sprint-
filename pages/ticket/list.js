import { useEffect, useState } from "react";
import styles from "@/styles/contact-submission.module.css";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/utils/constants";
import { Status } from "@/utils/constants";
import Pagination from "@/components/pagination";
import { getSession } from "next-auth/react";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const { data: session } = useSession();
  const role = session?.user.role;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const formatStatus = (status) => {
    return status.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/ticket");
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      } else {
        console.error("Failed to fetch tickets:", data.error);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    router.push("add");
  };

  const handleViewDetailsClick = (id) => {
    router.push(`ticket-details?id=${id}`);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleAssignedFilterChange = (e) => {
    setAssignedFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const filteredTickets = tickets
    .filter((ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((ticket) => (statusFilter ? ticket.status === statusFilter : true))
    .filter((ticket) =>
      assignedFilter === "assigned"
        ? ticket.assigned_to
        : assignedFilter === "unassigned"
        ? !ticket.assigned_to
        : true
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contactBox}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder="Search ticket by title.."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className={styles.searchInput}
          />
          <h4 className={styles.title}>Tickets</h4>
          <div className={styles.filterContainer}>
            <div className={styles.filter}>
              <label htmlFor="statusFilter">Filter by Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className={styles.statusFilter}
              >
                <option value="">All</option>
                {Object.values(Status).map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>
            {role !== UserRoles.User && (
              <div className={styles.filter}>
                <label htmlFor="assignedFilter">Filter by Assignment:</label>
                <select
                  id="assignedFilter"
                  value={assignedFilter}
                  onChange={handleAssignedFilterChange}
                  className={styles.statusFilter}
                >
                  <option value="">All</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
            )}

            {role === UserRoles.User && (
              <button
                className={styles.addOrganizationButton}
                onClick={handleClick}
              >
                Add Ticket
              </button>
            )}
          </div>
        </div>
        {currentItems.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Title</th>
                <th>Description</th>
                <th>Category</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((ticket, index) => (
                <tr key={ticket.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.description}</td>
                  <td>{ticket.tags}</td>
                  <td>{formatStatus(ticket.status)}</td>

                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => handleViewDetailsClick(ticket.id)}
                    >
                      View
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
          totalItems={filteredTickets.length}
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
