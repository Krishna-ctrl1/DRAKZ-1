// src/styles/ziko/admin/AdminLayout.styles.js
import styled from "styled-components";

export const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  /* Dark "Deep Space" background */
  background-color: #020617; 
  background-image: 
    radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.15) 0px, transparent 50%), 
    radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), 
    radial-gradient(at 100% 100%, rgba(15, 23, 42, 1) 0px, transparent 50%);
  background-attachment: fixed;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
`;

export const MainContent = styled.main`
  flex-grow: 1;
  padding: 30px;
  
  /* CALCULATION:
     250px (Sidebar Width) 
     + 1.5rem (Sidebar Left Offset ~24px) 
     + 2rem (New Margin/Gap ~32px) 
     = approx 310px 
  */
  margin-left: 310px; 
  
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    margin-left: 0; /* On mobile, sidebar usually disappears or overlaps */
    padding: 20px;
    padding-top: 80px; /* Space for a top mobile nav if you have one */
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 30px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Section = styled.section`
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const FullWidthBox = styled.div`
  grid-column: 1 / -1;
`;