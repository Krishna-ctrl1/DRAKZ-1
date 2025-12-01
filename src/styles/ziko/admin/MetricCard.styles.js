// src/styles/ziko/admin/MetricCard.styles.js
import styled from "styled-components";
import { Box } from "./SharedStyles";

export const MetricCardContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px; /* Taller to match screenshot */
  position: relative;
  overflow: hidden;
  
  /* Darker glass to match the high contrast in screenshot */
  background: rgba(15, 23, 42, 0.6); 
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

export const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const MetricTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

/* The Icon container matching the screenshot style */
export const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  
  /* Auto-colored backgrounds based on props if needed, or default blue */
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
`;

export const MetricValue = styled.p`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

export const MetricTrend = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => (props.isPositive ? "#4ade80" : "#f87171")};
  margin-bottom: 4px;

  & svg {
    margin-right: 4px;
  }
`;

/* Since the squiggly line in the screenshot is a real data visualization, 
   we can't replicate it perfectly with just CSS.
   However, this creates a "Pulse" line effect at the bottom right 
   to simulate that visual weight.
*/
export const MetricGraph = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 80px;
  height: 40px;
  
  /* Simple CSS Path Simulation */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 Q 25 40 35 20 T 70 30 T 100 10' stroke='%234ade80' stroke-width='3' fill='none' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.8;
  
  /* Change color filter based on trend (optional advanced CSS) */
  filter: ${(props) => (props.isPositive ? "none" : "hue-rotate(280deg)")}; 
`;