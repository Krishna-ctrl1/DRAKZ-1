import styled from "styled-components";
import { Box } from "./SharedStyles";

export const SystemLogsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const LogsArea = styled.textarea`
  background-color: #0d1222; /* Slightly darker than card for contrast */
  color: #e0e0e0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  font-family: "Cascadia Code", "Fira Code", monospace; /* Monospaced font for logs */
  font-size: 0.85rem;
  line-height: 1.5;
  height: 250px; /* Fixed height for log area */
  resize: vertical; /* Allow vertical resizing */
  width: 100%;
  overflow-y: auto;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);

  &:focus {
    outline: none;
    border-color: var(--primary-purple);
    box-shadow: 0 0 0 2px rgba(187, 134, 252, 0.3);
  }

  /* Custom scrollbar for logs area */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a2e;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(187, 134, 252, 0.5);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--primary-purple);
  }
`;