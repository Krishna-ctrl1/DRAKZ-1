import styled from "styled-components";
import { Box, Button } from "./SharedStyles";

export const UserTableContainer = styled(Box)`
  padding: 0; /* Remove padding from parent Box as table will have its own */
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.95rem;

  th,
  td {
    padding: 15px 24px;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    background-color: var(--accent-blue);
    color: var(--text-color);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(187, 134, 252, 0.05);
    }
  }

  .status-active {
    color: var(--accent-green);
    font-weight: 500;
  }

  .status-inactive {
    color: var(--accent-red);
    font-weight: 500;
  }
`;

export const ActionButton = styled(Button)`
  padding: 8px 12px;
  font-size: 0.85rem;
  margin-right: 8px;
  box-shadow: none;
  background-color: ${(props) =>
    props.secondary ? "rgba(255, 255, 255, 0.1)" : "var(--primary-purple)"};
  color: ${(props) => (props.secondary ? "var(--text-color)" : "var(--background-dark)")};

  &:hover {
    background-color: ${(props) =>
      props.secondary ? "rgba(255, 255, 255, 0.2)" : "var(--secondary-purple)"};
    transform: none;
    box-shadow: none;
  }
`;

export const AddUserButtonWrapper = styled.div`
  padding: 24px;
  border-top: 1px solid var(--border-color);
  background-color: var(--card-background);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;