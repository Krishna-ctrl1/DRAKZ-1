import React, { useEffect, useState } from "react";

import MetricCard from "./MetricCard";
// ContentOverview import removed
import SystemLogs from "./SystemLogs";
import ServerLoad from "./ServerLoad";

// Ensure these paths are correct based on your folder structure
import { GridContainer, Section } from "../../../styles/ziko/admin/AdminLayout.styles";
import { Title } from "../../../styles/ziko/admin/SharedStyles";
import { MdPeople, MdOutlineAddchart, MdStorage } from "react-icons/md";

const AdminDashboard = () => {
  // State to hold real data
  const [stats, setStats] = useState({
    totalUsers: "0",
    newUsersToday: "0",
    dataUsed: "0 MB"
  });

  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/dashboard-stats'); 
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalUsers: data.totalUsers.toLocaleString(),
            newUsersToday: data.newUsersToday.toString(),
            dataUsed: data.dataUsed
          });
        } else {
          console.error("Failed to fetch dashboard stats");
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <Title>Admin Dashboard</Title>

      <Section>
        <GridContainer>
          <MetricCard
            title="Total Users"
            value={loading ? "..." : stats.totalUsers}
            icon={<MdPeople />}
            trend="+12% since last month" 
            isPositive={true}
          />
          <MetricCard
            title="New Today"
            value={loading ? "..." : stats.newUsersToday}
            icon={<MdOutlineAddchart />}
            trend="Updated just now"
            isPositive={true}
          />
          <MetricCard
            title="Data Used"
            value={loading ? "..." : stats.dataUsed}
            icon={<MdStorage />}
            trend="Real-time DB Size"
            isPositive={true} 
          />
        </GridContainer>
      </Section>

      <Section>
        <GridContainer>
          <div style={{ gridColumn: "span 2" }}>
            <SystemLogs />
          </div>
          
          <ServerLoad />
        </GridContainer>
      </Section>
    </>
  );
};

export default AdminDashboard;