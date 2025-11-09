import React from "react";
import Sidebar from "../Sidebar";
import TopBar from "../TopBar";
import { DashboardContainer, MainContent } from "../../../../styles/ziko/admin/AdminLayout.styles";
import { Outlet } from "react-router-dom"; 

const AdminLayout = () => { 
  const role = localStorage.getItem("role") || "Admin";
  const email = localStorage.getItem("email") || "admin@example.com";

  return (
    <DashboardContainer>
      <Sidebar />
      <MainContent>
        <TopBar userName={role} userEmail={email} />
        <Outlet />
      </MainContent>
    </DashboardContainer>
  );
};

export default AdminLayout;