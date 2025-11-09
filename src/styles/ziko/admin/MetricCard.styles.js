import styled from "styled-components";
import { Box } from "./SharedStyles";

export const MetricCardContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150px;
`;

export const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

export const MetricTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

export const MetricIcon = styled.div`
  font-size: 1.5rem;
  color: var(--primary-purple);
  background-color: rgba(187, 134, 252, 0.1);
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MetricValue = styled.p`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
`;

export const MetricTrend = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: ${(props) => (props.isPositive ? "var(--accent-green)" : "var(--accent-red)")};

  & svg {
    margin-right: 5px;
  }
`;

export const MetricGraph = styled.div`
  width: 100%;
  height: 50px; /* Adjust height as needed for the sparkline graph */
  /* Placeholder for an actual graph component (e.g., Recharts, Nivo) */
  background: linear-gradient(
    to right,
    var(--primary-purple) 0%,
    rgba(187, 134, 252, 0.5) 100%
  );
  mask-image: linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  border-radius: 5px;
  opacity: 0.7;
`;