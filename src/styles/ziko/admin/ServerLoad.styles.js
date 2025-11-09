import styled from "styled-components";
import { Box } from "./SharedStyles";

export const ServerLoadContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
`;

export const ChartWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
`;

export const SvgCircle = styled.svg`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

export const CircleBackground = styled.circle`
  stroke-width: 10;
  stroke: var(--accent-blue);
  fill: none;
`;

export const CircleProgress = styled.circle`
  stroke-width: 10;
  stroke: var(--primary-purple);
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease-out;
`;

export const PercentageText = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
`;

export const LoadMetric = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 10px;
`;

export const LoadBarGraph = styled.div`
  width: 100%;
  margin-top: 20px;
  display: flex;
  align-items: flex-end; /* Align bars at the bottom */
  height: 60px; /* Height for the bar graph area */
  border-bottom: 1px solid var(--border-color);
`;

export const LoadBar = styled.div`
  width: 10px; /* Width of each bar */
  margin: 0 2px;
  background-color: var(--primary-purple);
  height: ${(props) => props.height}%; /* Dynamic height */
  transition: height 0.5s ease;
  border-radius: 2px 2px 0 0;
  opacity: ${(props) => props.height / 100 + 0.2}; /* Opacity based on height */
`;