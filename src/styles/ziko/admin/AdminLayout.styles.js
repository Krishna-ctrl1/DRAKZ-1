import styled from "styled-components";

export const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--background-dark);
`;

export const MainContent = styled.main`
  flex-grow: 1;
  padding: 30px;
  margin-left: 250px; /* Adjust based on sidebar width */
  transition: margin-left 0.3s ease;
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Section = styled.section`
  margin-bottom: 40px;
`;

export const FullWidthBox = styled.div`
  grid-column: 1 / -1; /* Spans across all columns */
`;