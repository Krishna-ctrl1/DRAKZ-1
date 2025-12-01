// src/styles/ziko/admin/UserTable.styles.js
import styled from "styled-components";
import { Box, Button } from "./SharedStyles";

// Remove the default Box styling to allow the table to sit directly on the glass
export const UserTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.95rem;
  color: #e2e8f0;

  th,
  td {
    padding: 18px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Header Styling matching 'holdings-table' in abhinay.css */
  th {
    background: rgba(255, 255, 255, 0.02);
    color: #94a3b8; /* Cool gray */
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
    white-space: nowrap;
  }

  /* Row Hover Effect */
  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
    
    /* Remove border from last row */
    &:last-child td {
      border-bottom: none;
    }
  }

  /* Status Colors */
  .status-active {
    color: #4ade80; /* Neon Green */
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    
    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #4ade80;
      box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
    }
  }

  .status-inactive {
    color: #f87171; /* Soft Red */
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #f87171;
      box-shadow: 0 0 8px rgba(248, 113, 113, 0.6);
    }
  }
`;

// Small Glass Button for Actions (Edit/Delete)
export const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${(props) => (props.secondary ? "#e2e8f0" : "#60a5fa")}; /* Blue or White */
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-right: 8px;

  &:hover {
    background: ${(props) => (props.secondary ? "rgba(255, 255, 255, 0.1)" : "rgba(96, 165, 250, 0.15)")};
    border-color: ${(props) => (props.secondary ? "rgba(255, 255, 255, 0.2)" : "rgba(96, 165, 250, 0.4)")};
    transform: translateY(-1px);
  }
`;

export const AddUserButtonWrapper = styled.div`
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  justify-content: flex-end;
`;