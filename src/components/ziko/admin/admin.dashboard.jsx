import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { BACKEND_URL } from "../../../config/backend";
import MetricCard from "./MetricCard";
import SystemLogs from "./SystemLogs";
import ServerLoad from "./ServerLoad";
import TopBar from "./TopBar/TopBar";
import AdvancedAnalytics from "./AdvancedAnalytics";

import { GridContainer, Section } from "../../../styles/ziko/admin/AdminLayout.styles";
import { Title } from "../../../styles/ziko/admin/SharedStyles";
import { MdPeople, MdAttachMoney, MdTrendingUp, MdCheckCircle, MdSupervisorAccount, MdPendingActions, MdStorage } from "react-icons/md";
import { UserTableContainer, StyledTable } from "../../../styles/ziko/admin/UserTable.styles";

const DashboardContainer = styled.div`
  padding: 20px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: "0",
    newUsersToday: "0",
    dataUsed: "0 MB",
    usersBreakdown: { active: 0, suspended: 0 },
    advisorsBreakdown: { total: 0, active: 0, pending: 0 },
    totalAUM: 0 // New
  });

  const [businessAnalytics, setBusinessAnalytics] = useState({
    totalVolume: 0,
    userGrowth: [],
    topAdvisors: []
  });

  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [dashboardRes, analyticsRes, businessRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/dashboard-stats`, { headers }),
          fetch(`${BACKEND_URL}/api/privilege/admin/analytics`, { headers }),
          fetch(`${BACKEND_URL}/api/privilege/admin/business-analytics`, { headers })
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
            advisorsBreakdown: analyticsData.advisors,
            totalAUM: analyticsData.financial ? analyticsData.financial.totalAUM : 0
          });
          setBusinessAnalytics(businessData);
          setChartData(analyticsData.charts); // Set Chart Data from Analytics Endpoint
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardContainer>
        <p style={{ color: "white", padding: "20px" }}>Loading dashboard...</p>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>

      <Section>
        <MetricsGrid>
          <MetricCard
            title="Total Revenue"
            value={`$${businessAnalytics.totalVolume.toLocaleString()}`}
            icon={<MdAttachMoney />}
            trend="Est. volume"
            color="#10b981"
            isPositive={true}
          />
          <MetricCard
            title="Total AUM"
            value={`$${(stats.totalAUM || 0).toLocaleString()}`}
            icon={<MdStorage />} // Using Storage icon or another suitable one
            trend="Assets Under Mgmt"
            color="#f43f5e"
            isPositive={true}
          />
          <MetricCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<MdPeople />}
            trend={`${stats.usersBreakdown.active} Active`}
            color="#3b82f6"
            isPositive={true}
          />
          <MetricCard
            title="Total Advisors"
            value={stats.advisorsBreakdown.total}
            icon={<MdSupervisorAccount />}
            trend={`${stats.advisorsBreakdown.active} Active`}
            color="#8b5cf6"
            isPositive={true}
          />
          <MetricCard
            title="Pending Approvals"
            value={stats.advisorsBreakdown.pending}
            icon={<MdPendingActions />}
            trend="Action Needed"
            color="#f59e0b"
            isPositive={stats.advisorsBreakdown.pending === 0}
          />
        </MetricsGrid>
      </Section>

      {/* ADVANCED ANALYTICS CHARTS */}
      <AdvancedAnalytics data={chartData} />

      <ContentGrid>
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

        {/* SERVER LOAD */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <ServerLoad />
        </div>
      </ContentGrid>

      <Section>
        <GridContainer>
          <div style={{ gridColumn: "span 3" }}>
            <SystemLogs />
          </div>
        </GridContainer>
      </Section>
    </DashboardContainer>
  );
};

export default AdminDashboard;