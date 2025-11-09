import styled from "styled-components";

export const Box = styled.div`
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
  }
`;

export const Button = styled.button`
  background-color: var(--primary-purple);
  color: var(--text-color);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(187, 134, 252, 0.4);

  &:hover {
    background-color: var(--secondary-purple);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(187, 134, 252, 0.6);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(187, 134, 252, 0.3);
  }

  &:disabled {
    background-color: #4a4a6f;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 24px;
  letter-spacing: 0.5px;
`;

export const Subtitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 16px;
`;

export const Text = styled.p`
  font-size: 1rem;
  color: var(--text-color);
  line-height: 1.6;
`;