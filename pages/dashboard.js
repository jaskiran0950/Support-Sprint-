import React, { useEffect, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import styles from "@/styles/dashboard.module.css";
import DashboardCard from "@/components/dashboard-card";
import { UserRoles } from "@/utils/constants";
import dynamic from "next/dynamic";

const Dashboard = () => {
  const { data: session } = useSession();
  const role = session?.user.role;
  const name = session?.user.name;
  const userId = session?.user.id;

  const [data, setData] = useState(null);

  const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
  });

  useEffect(() => {
    if (role === UserRoles.SuperAdmin) {
      fetch("/api/superadmin-dashboard")
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [role]);

  useEffect(() => {
    if (role === UserRoles.Admin) {
      fetch("/api/admin-dashboard")
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [role]);

  useEffect(() => {
    if (role === UserRoles.Support) {
      fetch("/api/support-dashboard")
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [role, userId]);

  useEffect(() => {
    if (role === UserRoles.User) {
      fetch("/api/user-dashboard")
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [role, userId]);

  const pieChartOptions = {
    chart: {
      type: "pie",
    },
    labels: ["New", "In Progress", "Closed"],
    colors: ["#007bff", "#ffc107", "#28a745"],
  };

  const pieChartData = data
    ? [
        data.ticketStatusCounts?.New,
        data.ticketStatusCounts?.InProgress,
        data.ticketStatusCounts?.Closed,
      ]
    : [];

  const totalTickets =
    data && data.ticketPriorityCounts
      ? data?.ticketPriorityCounts?.High +
        data?.ticketPriorityCounts?.Medium +
        data?.ticketPriorityCounts?.Low
      : 0;

  const columnChartOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["High", "Medium", "Low"],
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: function (val) {
          return val.toFixed(0) + "%";
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toFixed(2) + "%";
        },
      },
    },
  };

  const columnChartData = [
    {
      name: "Tickets",
      data: data
        ? [
            (data.ticketPriorityCounts?.High / totalTickets) * 100,
            (data.ticketPriorityCounts?.Medium / totalTickets) * 100,
            (data.ticketPriorityCounts?.Low / totalTickets) * 100,
          ]
        : [],
    },
  ];

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.userInfo}>
        <h1 className={styles.welcomeText}>Welcome back, {name}!</h1>
      </div>
      {role === UserRoles.SuperAdmin && (
        <>
          <div className={styles.dashboard}>
            <DashboardCard
              title="Organizations"
              count={data?.organizationCount || 0}
              subText="Total number of organizations"
            />
            <DashboardCard
              title="Admins"
              count={data?.adminCount || 0}
              subText="Total number of admins"
            />
            <DashboardCard
              title="Contact Requests"
              count={
                (data?.contactRequestCounts?.pending || 0) +
                (data?.contactRequestCounts?.completed || 0)
              }
              subTexts={[
                `Pending: ${data?.contactRequestCounts?.pending || 0}`,
                `Completed: ${data?.contactRequestCounts?.completed || 0}`,
              ]}
            />
          </div>
        </>
      )}
      {role === UserRoles.Admin && (
        <>
          <div className={styles.dashboard}>
            <DashboardCard
              title="Tickets"
              count={
                (data?.ticketStatusCounts?.New || 0) +
                (data?.ticketStatusCounts?.InProgress || 0) +
                (data?.ticketStatusCounts?.Closed || 0)
              }
              subTexts={[
                `New: ${data?.ticketStatusCounts?.New || 0}`,
                `In Progress: ${data?.ticketStatusCounts?.InProgress || 0}`,
                `Closed: ${data?.ticketStatusCounts?.Closed || 0}`,
              ]}
            />
            <DashboardCard
              title="Users"
              count={data?.userCount || 0}
              subTexts={["Total number of users"]}
            />
            <DashboardCard
              title="Support Members"
              count={data?.supportCount || 0}
              subTexts={["Total number of support members"]}
            />
          </div>
          <div className={styles.chartsContainer}>
            <div className={styles.chart}>
              <ReactApexChart
                options={pieChartOptions}
                series={pieChartData}
                type="pie"
                height={500}
                width={500}
              />
            </div>
            <div className={styles.chart}>
              <ReactApexChart
                options={columnChartOptions}
                series={columnChartData}
                type="bar"
                height={350}
                width={500}
              />
            </div>
          </div>
        </>
      )}
      {role === UserRoles.Support && (
        <div className={styles.dashboard}>
          <DashboardCard
            title="Total Tickets"
            count={data?.totalTickets || 0}
            subText="Total tickets of your organization."
          />
          <DashboardCard
            title="Assigned to You"
            count={data?.assignedTickets || 0}
            subText="Total tickets assigned to you."
          />
          <DashboardCard
            title="In Progress"
            count={data?.inProgressTickets || 0}
            subText=" Tickets In-progress assigned to you."
          />
          <DashboardCard
            title="Closed Tickets"
            count={data?.closedTickets || 0}
            subText="Closed tickets that you resolved."
          />
        </div>
      )}
      {role === UserRoles.User && (
        <>
          <div className={styles.dashboard}>
            <DashboardCard
              title="Tickets"
              count={data?.totalTickets || 0}
              subText="Total tickets raised by you."
            />
            <DashboardCard
              title="Unassigned"
              count={data?.unassignedTickets || 0}
              subText="Unassigned tickets "
            />
            <DashboardCard
              title="In Progress"
              count={data?.inProgressTickets || 0}
              subText="Tickets In progress  "
            />
            <DashboardCard
              title="Closed "
              count={data?.closedTickets || 0}
              subText=" Closed Tickets. "
            />
          </div>
        </>
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

export default Dashboard;
