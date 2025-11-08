import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../global/Header";
import Sidebar from "../global/Sidebar";

const AdvisorDashboard = () => {
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Advisor Dashboard</h1>
      <p>You have successfully logged in as: <strong>{role}</strong></p>
      {email && <p>Logged in user: {email}</p>}

      <div style={{
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #e20707ff",
        width: "300px",
        borderRadius: "8px"
      }}>
        <p>This page is ONLY for Advisors.</p>
      </div>
    </div>
  );
};

export default AdvisorDashboard;