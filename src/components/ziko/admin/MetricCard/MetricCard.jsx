import React from "react";
import {
  MetricCardContainer,
  MetricHeader,
  MetricTitle,
  MetricIcon,
  MetricValue,
  MetricTrend,
  MetricGraph,
} from "../../../../styles/ziko/admin/MetricCard.styles"; // Adjusted import path
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

const MetricCard = ({ title, value, icon, trend, isPositive }) => {
  return (
    <MetricCardContainer>
      <MetricHeader>
        <MetricTitle>{title}</MetricTitle>
        <MetricIcon>{icon}</MetricIcon>
      </MetricHeader>
      <MetricValue>{value}</MetricValue>
      {trend && (
        <MetricTrend $isPositive={isPositive}>
          {isPositive ? <MdTrendingUp /> : <MdTrendingDown />}
          {trend}
        </MetricTrend>
      )}
      <MetricGraph $isPositive={isPositive} />
    </MetricCardContainer>
  );
};

export default MetricCard;