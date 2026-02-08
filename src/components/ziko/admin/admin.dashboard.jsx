import React, { useEffect, useState } from "react";
import styled from "styled-components";
import MetricCard from "./MetricCard";
import SystemLogs from "./SystemLogs";
import ServerLoad from "./ServerLoad";

import { GridContainer, Section } from "../../../styles/ziko/admin/AdminLayout.styles";
import { Title } from "../../../styles/ziko/admin/SharedStyles";
import { MdPeople, MdOutlineAddchart, MdStorage, MdAttachMoney, MdTrendingUp } from "react-icons/md";
import { UserTableContainer, StyledTable } from "../../../styles/ziko/admin/UserTable.styles";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: "0",
    newUsersToday: "0",
    dataUsed: "0 MB",
    usersBreakdown: { active: 0, suspended: 0 },
    advisorsBreakdown: { total: 0, active: 0, pending: 0 }
  });

  const [businessAnalytics, setBusinessAnalytics] = useState({
    totalVolume: 0,
    userGrowth: [],
    topAdvisors: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [dashboardRes, analyticsRes, businessRes] = await Promise.all([
          fetch('http://localhost:3001/api/dashboard-stats', { headers }),
          fetch('http://localhost:3001/api/privilege/admin/analytics', { headers }),
          fetch('http://localhost:3001/api/privilege/admin/business-analytics', { headers })
        ]);

        if (dashboardRes.ok && analyticsRes.ok) {
          const dashboardData = await dashboardRes.json();
          const analyticsData = await analyticsRes.json();
          const businessData = businessRes.ok ? await businessRes.json() : { totalVolume: 0, userGrowth: [], topAdvisors: [] };

          setStats({
            totalUsers: dashboardData.totalUsers.toLocaleString(),
            newUsersToday: dashboardData.newUsersToday.toString(),
            dataUsed: dashboardData.dataUsed,
            usersBreakdown: analyticsData.users,
            advisorsBreakdown: analyticsData.advisors
          });
          setBusinessAnalytics(businessData);
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
        <GridContainer style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <MetricCard
            title="Total Revenue"
            value={loading ? "..." : `$${businessAnalytics.totalVolume.toLocaleString()}`}
            icon={<MdAttachMoney />}
            trend="Est. volume"
            isPositive={true}
          />
          <MetricCard
            title="Total Users"
            value={loading ? "..." : stats.totalUsers}
            icon={<MdPeople />}
            trend={`${stats.usersBreakdown.active} Active, ${stats.usersBreakdown.suspended} Suspended`}
            isPositive={true}
          />
          <MetricCard
            title="Advisors"
            value={loading ? "..." : stats.advisorsBreakdown.total}
            icon={<MdTrendingUp />}
            trend={`${stats.advisorsBreakdown.active} Active, ${stats.advisorsBreakdown.pending} Pending`}
            isPositive={stats.advisorsBreakdown.pending > 0}
          />
        </GridContainer>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* TOP ADVISORS TABLE */}
        <UserTableContainer>
          <h3 style={{ color: 'white', margin: '20px' }}>Top Performing Advisors</h3>
          {businessAnalytics.topAdvisors.length > 0 ? (
            <StyledTable>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Exp (Yrs)</th>
                </tr>
              </thead>
              <tbody>
                {businessAnalytics.topAdvisors.map(advisor => (
                  <tr key={advisor._id}>
                    <td>{advisor.name}</td>
                    <td>{advisor.advisorProfile?.specialization}</td>
                    <td>{advisor.advisorProfile?.experience}</td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          ) : (
            <p style={{ padding: '20px', color: '#a0a0b0' }}>No active advisors yet.</p>
          )}
        </UserTableContainer>

        {/* SERVER LOAD (Moved here) */}
        <ServerLoad />
      </div>

      <Section>
        <GridContainer>
          <div style={{ gridColumn: "span 3" }}>
            <SystemLogs />
          </div>
        </GridContainer>
      </Section>
    </>
  );
};

export default AdminDashboard;