import React from "react";

import MetricCard from "./MetricCard";
import UserTable from "./UserTable";
import ContentOverview from "./ContentOverview";
import SystemLogs from "./SystemLogs";
import ServerLoad from "./ServerLoad";

import { GridContainer, Section, FullWidthBox } from "../../../styles/ziko/admin/AdminLayout.styles";
import { Title } from "../../../styles/ziko/admin/SharedStyles";
import { MdPeople, MdOutlineAddchart, MdStorage } from "react-icons/md";

const AdminDashboard = () => {
  //Fetch real data here  
  const totalUsers = "1,145";
  const newUsersToday = "225";
  const dataUsed = "45.7 GB";

  return (
    <>
      <Title>Admin Dashboard</Title>

      <Section>
        <GridContainer>
          <MetricCard
            title="Total Users"
            value={totalUsers}
            icon={<MdPeople />}
            trend="+12% since last month"
            isPositive={true}
          />
          <MetricCard
            title="New Today"
            value={newUsersToday}
            icon={<MdOutlineAddchart />}
            trend="+5% vs yesterday"
            isPositive={true}
          />
          <MetricCard
            title="Data Used"
            value={dataUsed}
            icon={<MdStorage />}
            trend="-2% vs last week"
            isPositive={false}
          />
        </GridContainer>
      </Section>

      <Section>
        <FullWidthBox>
          <UserTable />
        </FullWidthBox>
      </Section>

      <Section>
        <GridContainer>
          <ContentOverview />
          <SystemLogs />
          <ServerLoad />
        </GridContainer>
      </Section>
    </>
  );
};

export default AdminDashboard;