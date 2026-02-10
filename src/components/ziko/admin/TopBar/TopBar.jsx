import React from "react";
import {
  TopBarContainer,
  UserInfo,
  UserAvatar,
  UserName,
  LogoutButton,
} from "../../../../styles/ziko/admin/Topbar.styles"; // Adjusted import path
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthProvider";

const TopBar = ({ userName, userEmail }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return "AD"; // Default if no name
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <TopBarContainer>
      <UserInfo>
        <UserAvatar>{getInitials(userName)}</UserAvatar>
        <UserName>Welcome, {userName}</UserName>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </UserInfo>
    </TopBarContainer>
  );
};

export default TopBar;