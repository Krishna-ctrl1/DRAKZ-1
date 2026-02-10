import React, { useState } from 'react';
import styled from 'styled-components';
import UserTable from './UserTable/UserTable.jsx';
import AdvisorApprovals from './AdvisorApprovals.jsx';
import { Title } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';

const TabContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$active ? '#fff' : '#ffffff80'};
  font-size: 1rem;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -11px;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${props => props.$active ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'transparent'};
    border-radius: 3px 3px 0 0;
  }
`;

const UserManagementPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <>
      <Title>User & Advisor Management</Title>

      <Section>
        <FullWidthBox>
          <TabContainer>
            <TabButton $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
              All Users
            </TabButton>
            <TabButton $active={activeTab === 'advisors'} onClick={() => setActiveTab('advisors')}>
              Active Advisors
            </TabButton>
            <TabButton $active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')}>
              Pending Approvals
            </TabButton>
          </TabContainer>

          {activeTab === 'users' && <UserTable role="user" />}
          {activeTab === 'advisors' && <UserTable role="advisor" />}
          {activeTab === 'approvals' && <AdvisorApprovals />}

        </FullWidthBox>
      </Section>
    </>
  );
};

export default UserManagementPage;