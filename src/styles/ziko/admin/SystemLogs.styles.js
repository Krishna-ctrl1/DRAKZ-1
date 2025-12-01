// src/styles/ziko/admin/SystemLogs.styles.js
import styled from "styled-components";
import { Box } from "./SharedStyles";

export const SystemLogsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const LogsArea = styled.textarea`
  /* Terminal Look */
  background-color: rgba(0, 0, 0, 0.3); 
  color: #e2e8f0; /* Soft code-white */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  
  height: 250px;
  resize: vertical;
  width: 100%;
  overflow-y: auto;
  
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1; /* Indigo focus */
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  /* Custom Slim Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
    margin: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(99, 102, 241, 0.5); /* Indigo hover */
  }
`;