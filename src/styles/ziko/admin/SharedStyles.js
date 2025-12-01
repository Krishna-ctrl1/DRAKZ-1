// src/styles/ziko/admin/SharedStyles.js
import styled from "styled-components";

// --- UPDATED DARK GLASS CARD ---
export const Box = styled.div`
  /* Darker background to match premium dashboard look */
  background: rgba(15, 23, 42, 0.6); 
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  
  /* Subtle border */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  
  /* Deep shadow for pop */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

export const Button = styled.button`
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #ffffff;
  border: none;
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.4);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

export const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Text = styled.p`
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 0;
`;