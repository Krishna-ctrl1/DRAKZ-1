import React from 'react';
import SystemLogs from './SystemLogs'; // Import the component
import { Title } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';

const LogsPage = () => {
  return (
    <>
      <Title>System Logs</Title>
      
      <Section>
        <FullWidthBox>
          <SystemLogs />
        </FullWidthBox>
      </Section>
    </>
  );
};

export default LogsPage;