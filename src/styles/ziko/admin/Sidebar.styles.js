// src/styles/ziko/admin/Sidebar.styles.js
import styled from "styled-components";
import { Link } from "react-router-dom";

export const SidebarContainer = styled.aside`
  width: 250px;
  /* Floating geometry matching Sidebar.css */
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  bottom: 1.5rem;
  height: calc(100vh - 3rem);
  
  /* Deep Night Gradient from Sidebar.css */
  background: linear-gradient(-45deg, #000000, #111827, #0f0c29, #302b63);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  
  border-radius: 24px; /* Rounded corners */
  border: 1px solid rgba(255, 255, 255, 0.08);
  
  display: flex;
  flex-direction: column;
  padding: 30px 15px;
  z-index: 1000;
  transition: width 0.3s ease-in-out;
  overflow-y: auto;
  overflow-x: hidden;

  /* Hide Scrollbar */
  &::-webkit-scrollbar {
    width: 0px;
  }
`;

export const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 40px;
  /* Gradient Text Effect */
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
  text-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
`;

export const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px; /* Space between pills */
`;

export const NavItem = styled.li`
  width: 100%;
`;

export const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #94a3b8; /* Muted gray by default */
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 16px; /* Slightly softer corners like the screenshot */
  transition: all 0.3s ease;
  margin-bottom: 4px;

  & svg {
    margin-right: 12px;
    font-size: 1.2rem;
    color: #94a3b8;
    transition: color 0.3s ease;
  }

  /* Hover State */
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    
    & svg {
      color: #ffffff;
    }
  }

  /* ACTIVE STATE - MATCHING THE SCREENSHOT */
  &.active {
    /* Solid, bright gradient matching the 'Privileges' button */
    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); 
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); /* Purple Glow */

    & svg {
      color: #ffffff;
    }
  }
`;

export const FooterText = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;