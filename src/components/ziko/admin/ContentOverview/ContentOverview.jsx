import React from "react";
import {
  ContentOverviewContainer,
  ContentGrid,
  ContentCard,
  ContentCardTitle,
  ContentCardValue,
} from "../../../../styles/ziko/admin/ContentOverview.styles"; // Adjusted import path
import { Title } from "../../../../styles/ziko/admin/SharedStyles"; // Adjusted import path

const ContentOverview = () => {
  const contentStats = [
    { type: "Blog Posts", count: 145 },
    { type: "Categories", count: 35 },
    { type: "Products", count: 280 }, // Example
  ];

  const handleCardClick = (type) => {
    console.log(`Navigating to ${type} management.`);
    // Implement navigation to respective content management pages
  };

  return (
    <ContentOverviewContainer>
      <Title>Content Overview</Title>
      <ContentGrid>
        {contentStats.map((item) => (
          <ContentCard key={item.type} onClick={() => handleCardClick(item.type)}>
            <ContentCardTitle>{item.type}</ContentCardTitle>
            <ContentCardValue>{item.count}</ContentCardValue>
          </ContentCard>
        ))}
      </ContentGrid>
    </ContentOverviewContainer>
  );
};

export default ContentOverview;