import React from "react";
import { useLocation } from "react-router-dom"; // For active link styling
import {
  SidebarContainer,
  Logo,
  NavList,
  NavItem,
  NavLink,
  FooterText,
} from "../../../../styles/ziko/admin/Sidebar.styles"; // Adjusted import path
import {
  MdDashboard,
  MdPeople,
  MdArticle,
  MdSettings,
  MdLogout,
  MdVerifiedUser,
  MdSupportAgent,
  MdLibraryBooks,
  MdSecurity,
  MdListAlt
} from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/admin/dashboard", icon: <MdDashboard />, label: "Dashboard" },

    { path: "/admin/users", icon: <MdPeople />, label: "Users" },
    { path: "/admin/content", icon: <MdArticle />, label: "Content" },
    { path: '/admin/support', icon: <MdSupportAgent />, label: 'Support' },
    { path: '/admin/verification', icon: <MdVerifiedUser />, label: 'Verification' },
    { path: '/admin/access-control', icon: <MdSecurity />, label: 'Admins' },
    { path: "/admin/settings", icon: <MdSettings />, label: "Settings" },
    { path: "/admin/logs", icon: <MdListAlt />, label: "Logs" },
  ];

  return (
    <SidebarContainer>
      <Logo>Admin Panel</Logo>
      <NavList>
        {navItems.map((item) => (
          <NavItem key={item.path}>
            <NavLink
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              {item.icon}
              {item.label}
            </NavLink>
          </NavItem>
        ))}
      </NavList>
      <FooterText>© 2023 Admin Dashboard</FooterText>
    </SidebarContainer>
  );
};

export default Sidebar;