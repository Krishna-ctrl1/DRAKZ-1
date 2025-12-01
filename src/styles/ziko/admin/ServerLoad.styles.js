// src/styles/ziko/admin/ServerLoad.styles.js
import styled from "styled-components";
import { Box } from "./SharedStyles";

export const ServerLoadContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  position: relative;
  /* Optional: Add a subtle inner glow */
  box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05);
`;

export const ChartWrapper = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3)); /* Glow effect for the whole chart */
`;

export const SvgCircle = styled.svg`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

export const CircleBackground = styled.circle`
  stroke-width: 8;
  stroke: rgba(255, 255, 255, 0.1); /* Subtle track */
  fill: none;
`;

export const CircleProgress = styled.circle`
  stroke-width: 8;
  /* We can't use linear-gradient on stroke easily in SVG without a defs tag, 
     so we use the bright primary blue matching the theme */
  stroke: #60a5fa; 
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const PercentageText = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
`;

export const LoadMetric = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

export const LoadBarGraph = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 60px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const LoadBar = styled.div`
  width: 8px;
  border-radius: 4px;
  margin: 0 2px;
  
  /* Dynamic height is passed via inline styles in the JSX, 
     but we set the color and transition here */
  background-color: #60a5fa; 
  
  /* Opacity calculation (simulated logic): 
     Higher bars are more opaque/glowing */
  opacity: ${(props) => Math.max(0.3, props.height / 100)};
  
  transition: height 0.5s ease, opacity 0.5s ease;
  box-shadow: 0 0 8px rgba(96, 165, 250, 0.4); /* Glow */

  &:hover {
    background-color: #ffffff;
    opacity: 1 !important;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
  }
`;