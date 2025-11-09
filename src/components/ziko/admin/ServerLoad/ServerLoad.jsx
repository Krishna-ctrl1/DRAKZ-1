import React, { useState, useEffect } from "react";
import {
  ServerLoadContainer,
  ChartWrapper,
  SvgCircle,
  CircleBackground,
  CircleProgress,
  PercentageText,
  LoadMetric,
  LoadBarGraph,
  LoadBar,
} from "../../../../styles/ziko/admin/ServerLoad.styles"; // Adjusted import path
import { Title } from "../../../../styles/ziko/admin/SharedStyles"; // Adjusted import path

const ServerLoad = () => {
  const [cpuUsage, setCpuUsage] = useState(75); // Example initial value
  const [loadHistory, setLoadHistory] = useState(
    Array.from({ length: 20 }, () => Math.floor(Math.random() * 80) + 10)
  ); // 20 bars

  useEffect(() => {
    // Simulate real-time updates for CPU usage and load history
    const interval = setInterval(() => {
      const newCpu = Math.floor(Math.random() * 40) + 30; // 30-70%
      setCpuUsage(newCpu);
      setLoadHistory((prevHistory) => {
        const newHistory = [...prevHistory.slice(1), newCpu]; // Shift and add new
        return newHistory;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const radius = 60; // Radius of the circle
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cpuUsage / 100) * circumference;

  return (
    <ServerLoadContainer>
      <Title>Server Load</Title>
      <ChartWrapper>
        <SvgCircle viewBox="0 0 150 150">
          <CircleBackground cx="75" cy="75" r={radius} />
          <CircleProgress
            cx="75"
            cy="75"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </SvgCircle>
        <PercentageText>{cpuUsage}%</PercentageText>
      </ChartWrapper>
      <LoadMetric>CPU Usage</LoadMetric>
      <LoadBarGraph>
        {loadHistory.map((load, index) => (
          <LoadBar key={index} height={load} />
        ))}
      </LoadBarGraph>
    </ServerLoadContainer>
  );
};

export default ServerLoad;