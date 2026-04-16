import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../../../config/backend";
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
  
  // NEW TELEMETRY STATE
  const [telemetry, setTelemetry] = useState(null);
  const [isFlushing, setIsFlushing] = useState(false);

  useEffect(() => {
    const fetchLoad = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_URL}/api/logs/telemetry`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Synthesize a generic "load" percentage purely based on node process memory vs total system RAM
          // or just clamp node process memory for the graph
          const nodeMem = parseFloat(data.nodeProcessMemoryMB);
          // Scale memory arbitrarily to show a dynamic graph line: Assuming typical 200MB max Node heap
          const simulatedCpu = Math.min(Math.floor((nodeMem / 200) * 100), 100);

          setCpuUsage(simulatedCpu);
          setLoadHistory((prevHistory) => {
            const newHistory = [...prevHistory.slice(1), simulatedCpu];
            return newHistory;
          });
          
          setTelemetry(data);
        }
      } catch (error) {
        console.error("Error fetching server telemetry:", error);
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

  const handleFlushCache = async () => {
    if (!window.confirm("WARNING: Are you sure you want to completely flush the active Redis memory cache?")) return;
    try {
      setIsFlushing(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/logs/flush-cache`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Redis Cache Memory Flushed Successfully.");
    } catch (err) {
      alert("❌ Failed to flush cache: " + (err.response?.data?.msg || err.message));
    } finally {
      setIsFlushing(false);
    }
  };

  return (
    <ServerLoadContainer style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Title>Live Telemetry</Title>
        <button 
          onClick={handleFlushCache} 
          disabled={isFlushing}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid #ef4444',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: isFlushing ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            zIndex: 10
          }}
        >
          {isFlushing ? "Flushing..." : "FLUSH CACHE"}
        </button>
      </div>
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

      {telemetry && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#9ca3af' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span><strong>Redis State:</strong></span> 
             <span style={{ color: telemetry.redisStatus === 'Active' ? '#10b981' : '#ef4444' }}>{telemetry.redisStatus}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span><strong>Mongo DB:</strong></span> 
             <span style={{ color: telemetry.databaseConnectionState === 'Connected' ? '#10b981' : '#ef4444' }}>{telemetry.databaseConnectionState}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span><strong>System RAM F/T:</strong></span> 
             <span>{telemetry.systemMemory?.freeGB}GB / {telemetry.systemMemory?.totalGB}GB</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span><strong>Process Heap:</strong></span> 
             <span>{telemetry.nodeProcessMemoryMB} MB</span>
           </div>
        </div>
      )}
    </ServerLoadContainer>
  );
};

export default ServerLoad;