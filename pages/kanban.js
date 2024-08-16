import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "@/styles/kanban.module.css";

const KanbanPage = () => {
  const [tickets, setTickets] = useState([]);
  const { data: session } = useSession();
  const userId = session?.user?.userId;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const response = await fetch("/api/ticket");
    const data = await response.json();
    setTickets(data.data);
  };

  const moveTicket = async (ticketId, newStatus) => {
    const updatedTicket = tickets.find((ticket) => ticket.id === ticketId);
    if (
      (updatedTicket.status === "New" && newStatus === "Closed") ||
      (updatedTicket.status === "Closed" && newStatus === "New")
    ) {
      return;
    }
    updatedTicket.status = newStatus;

    if (newStatus === "InProgress" && !updatedTicket.assigned_to) {
      updatedTicket.assigned_to = userId;
    }

    await fetch(`/api/ticket/${ticketId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTicket),
    });

    fetchTickets();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.kanbanBoard}>
        {["New", "InProgress", "Closed"].map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={tickets}
            moveTicket={moveTicket}
          />
        ))}
      </div>
    </DndProvider>
  );
};

const KanbanColumn = ({ status, tickets, moveTicket }) => {
  const formatStatus = (status) => {
    return status.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  const [{ isOver }, drop] = useDrop({
    accept: "ticket",
    drop: (item) => moveTicket(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const filteredTickets = tickets.filter((ticket) => ticket.status === status);

  const getStatusClass = (status) => {
    switch (status) {
      case "New":
        return styles.statusNew;
      case "InProgress":
        return styles.statusInProgress;
      case "Closed":
        return styles.statusClosed;
      default:
        return "";
    }
  };

  return (
    <div
      className={`${styles.kanbanColumn} ${isOver ? styles.hover : ""}`}
      ref={drop}
    >
      <h4 className={getStatusClass(status)}>{formatStatus(status)}</h4>
      {filteredTickets.map((ticket) => (
        <KanbanCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};

const KanbanCard = ({ ticket }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "ticket",
    item: { id: ticket.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const router = useRouter();

  const handleViewDetailsClick = (id) => {
    router.push(`/ticket/ticket-details?id=${id}`);
  };

  const getBadgeClass = (priority) => {
    switch (priority) {
      case "Low":
        return styles.badgeLow;
      case "Medium":
        return styles.badgeMedium;
      case "High":
        return styles.badgeHigh;
      default:
        return "";
    }
  };

  return (
    <div
      className={`${styles.kanbanCard} ${isDragging ? styles.dragging : ""}`}
      ref={drag}
      onClick={() => handleViewDetailsClick(ticket.id)}
    >
      <h6>{ticket.title}</h6>
      {ticket.assigned_to && (
        <div>
          <strong>Assigned to:</strong> {ticket.assigned_to_id?.name}
        </div>
      )}
      {ticket.priority && (
        <span
          className={`${styles.ticketDetailsContainer} ${getBadgeClass(
            ticket.priority
          )}`}
        >
          {ticket.priority}
        </span>
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

export default KanbanPage;
