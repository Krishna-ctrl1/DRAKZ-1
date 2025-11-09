import styled from "styled-components";

export const TopBarContainer = styled.header`
  display: flex;
  justify-content: flex-end; /* Pushes content to the right */
  align-items: center;
  padding: 20px 0;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-purple);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-color);
  margin-right: 15px;
  box-shadow: 0 2px 10px rgba(187, 134, 252, 0.5);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

export const UserName = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-color);
  margin-right: 20px;
`;

export const LogoutButton = styled.button`
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease,
    color 0.3s ease;
  font-size: 0.95rem;

  &:hover {
    background-color: var(--primary-purple);
    border-color: var(--primary-purple);
    color: var(--background-dark);
  }
`;