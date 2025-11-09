import React from "react";

const AdminDashboard = () => {
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
        color: "var(--text-color, #fff)",
      }}
    >
      <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
      <p>
        You have successfully logged in as: <strong>{role}</strong>
      </p>
      {email && <p>Logged in user: {email}</p>}

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid rgba(255,255,255,0.25)",
          width: "320px",
          borderRadius: "8px",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(4px)",
        }}
      >
        <p style={{ margin: 0 }}>This page is ONLY for Admins.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
