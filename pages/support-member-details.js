import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Rating } from "react-simple-star-rating";
import styles from "@/styles/SupportMemberDetails.module.css";

// Dynamically import the ApexCharts component
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SupportMemberDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [supportMember, setSupportMember] = useState(null);
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/user/${id}`);
          const data = await response.json();

          if (data.success) {
            setSupportMember(data.data);
            fetchSupportMemberStats(data.data.id);
          } else {
            throw new Error(data.error);
          }
        } catch (error) {
          setError("Failed to fetch support member details");
          console.error("Failed to fetch support member:", error.message);
        }
      }
    };

    fetchData();
  }, [id]);

  const fetchSupportMemberStats = async (supportMemberId) => {
    try {
      const response = await fetch(
        `/api/support-member-stats?supportMemberId=${supportMemberId}`
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
        setFeedbacks(data.data.feedbacks.slice(0, 5));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError("Failed to fetch support member stats");
      console.error("Failed to fetch support member stats:", error.message);
    }
  };

  // Chart options and series
  const chartOptions = {
    chart: {
      type: "pie",
    },
    labels: ["New Tickets", "In Progress Tickets", "Closed Tickets"],
    colors: ["#007bff", "#ffc107", "#28a745"],
    legend: {
      position: "right",
      verticalAlign: "middle",
    },
  };

  const chartSeries = stats
    ? [stats.newTickets, stats.inProgressTickets, stats.closedTickets]
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <div className={styles.card}>
          <h4 className={styles.title}>
            <strong>{supportMember?.name}</strong>
          </h4>
          <div className={styles.details}>
            <p>
              <strong>Email:</strong> {supportMember?.email} <br></br>
              <strong>Phone:</strong> {supportMember?.mobile}
            </p>
          </div>
        </div>
        {stats && (
          <>
            <div className={styles.stats}>
              <div className={styles.card}>
                <h5>Total Tickets</h5>
                <p>{stats.totalTickets}</p>
              </div>
              <div className={styles.card}>
                <h5>New Tickets</h5>
                <p>{stats.newTickets}</p>
              </div>
              <div className={styles.card}>
                <h5>In Progress Tickets</h5>
                <p>{stats.inProgressTickets}</p>
              </div>
              <div className={styles.card}>
                <h5>Closed Tickets</h5>
                <p>{stats.closedTickets}</p>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="pie"
                width="500"
              />
            </div>
          </>
        )}
      </div>
      <div className={styles.rightColumn}>
        <div className={styles.ratingCard}>
          <h4>
            <strong>Average Rating</strong>
          </h4>
          <Rating
            initialValue={stats ? stats.avgRating : 0} // Assume avgRating is on a 0-5 scale
            size={40}
            readonly={true}
            activeColor="#ffd700"
          />
        </div>
        <div className={styles.feedbacks1}>
          <h4>
            <strong>Feedbacks</strong>
          </h4>
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback, index) => (
              <div key={index} className={styles.feedback}>
                <p>{feedback.message}</p>
              </div>
            ))
          ) : (
            <p>No feedbacks available</p>
          )}
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default SupportMemberDetails;
