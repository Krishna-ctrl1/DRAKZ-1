import styled from "styled-components";
import { Link } from "react-router-dom"; // Assuming react-router-dom for navigation

export const SidebarContainer = styled.aside`
  width: 250px;
  background-color: var(--card-background);
  color: var(--text-color);
  padding: 30px 0;
  position: fixed;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
  border-right: 1px solid var(--border-color);
  z-index: 1000;
`;

export const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  color: var(--primary-purple);
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(187, 134, 252, 0.5);
`;

export const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* Pushes content down if needed */
`;

export const NavItem = styled.li`
  margin-bottom: 8px;
`;

export const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 15px 30px;
  color: var(--text-color);
  text-decoration: none;
  font-size: 1.05rem;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease,
    transform 0.2s ease;
  border-left: 5px solid transparent;

  & svg {
    margin-right: 15px;
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.7);
    transition: color 0.3s ease;
  }

  &:hover {
    background-color: var(--accent-blue);
    border-left-color: var(--primary-purple);
    transform: translateX(5px);
    color: var(--primary-purple);

    & svg {
      color: var(--primary-purple);
    }
  }

  &.active {
    background-color: var(--accent-blue);
    border-left-color: var(--primary-purple);
    color: var(--primary-purple);
    font-weight: 600;

    & svg {
      color: var(--primary-purple);
    }
  }
`;

export const FooterText = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-top: 30px;
  padding: 0 20px;
`;