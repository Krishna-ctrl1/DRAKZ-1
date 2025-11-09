import React from 'react';
import UserTable from './UserTable'; // Import the component
import { Title } from '../../../styles/ziko/admin/SharedStyles'; // Import the Title
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles'; // Import layout styles

const UserManagementPage = () => {
  return (
    <>
      <Title>User Management</Title>
      
      <Section>
        <FullWidthBox>
          <UserTable />
        </FullWidthBox>
      </Section>
    </>
  );
};

export default UserManagementPage;