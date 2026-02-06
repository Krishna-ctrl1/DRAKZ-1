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
} from "../../../../styles/ziko/admin/ServerLoad.styles";
import { Title } from "../../../../styles/ziko/admin/SharedStyles";

const ServerLoad = () => {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [loadHistory, setLoadHistory] = useState(
    Array.from({ length: 20 }, () => 0)
  );

  useEffect(() => {
    const fetchLoad = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/server-metrics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const newCpu = data.cpuUsage;

          setCpuUsage(newCpu);
          setLoadHistory((prevHistory) => {
            const newHistory = [...prevHistory.slice(1), newCpu];
            return newHistory;
          });
        }
      } catch (error) {
        console.error("Error fetching server load:", error);
      }
    };

    fetchLoad();
    // 3 seconds is good, but since the API now takes 0.5s to respond, 
    // the total cycle will be ~3.5s.
    const interval = setInterval(fetchLoad, 3000);

    return () => clearInterval(interval);
  }, []);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const validUsage = Math.min(Math.max(cpuUsage, 0), 100);
  const strokeDashoffset = circumference - (validUsage / 100) * circumference;

  // Helper to format the display text
  // If usage is between 0 and 1, show "<1%" to reassure user it's working
  const displayUsage = cpuUsage > 0 && cpuUsage < 1 ? "< 1" : cpuUsage;

  return (
    <ServerLoadContainer>
      <Title>Server Load</Title>
      <ChartWrapper>
        <SvgCircle viewBox="0 0 150 150">
          <CircleBackground cx="75" cy="75" r={radius} />
          {/* Add a small transition for smooth animation */}
          <CircleProgress
            cx="75"
            cy="75"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </SvgCircle>
        <PercentageText>{displayUsage}%</PercentageText>
      </ChartWrapper>
      <LoadMetric>CPU Usage</LoadMetric>
      <LoadBarGraph>
        {loadHistory.map((load, index) => (
          // Multiply height by 2 or 3 if values are small (e.g. 2%) to make them visible
          // Or just render accurate height
          <LoadBar key={index} height={load < 5 && load > 0 ? 5 : load} />
        ))}
      </LoadBarGraph>
    </ServerLoadContainer>
  );
};

export default ServerLoad;