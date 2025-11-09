import styled from "styled-components";
import { Box } from "./SharedStyles";

export const ContentOverviewContainer = styled(Box)``;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

export const ContentCard = styled(Box)`
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  background-color: var(--accent-blue);
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background-color: rgba(187, 134, 252, 0.1);
    border-color: var(--primary-purple);
  }
`;

export const ContentCardTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 10px;
  color: var(--text-color);
`;

export const ContentCardValue = styled.p`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: var(--primary-purple);
`;