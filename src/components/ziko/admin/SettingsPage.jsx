import React from 'react';
import { Title, Subtitle } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';
import { Box } from '../../../styles/ziko/admin/SharedStyles'; // Reusing Box for style

const SettingsPage = () => {
  return (
    <>
      <Title>Settings</Title>
      
      <Section>
        <FullWidthBox>
          <Box> {/* Using the Box component for a nice container */}
            <Subtitle>Application Settings</Subtitle>
            <p>Admin settings and application configurations will be available here.</p>
            <p>Coming soon...</p>
          </Box>
        </FullWidthBox>
      </Section>
    </>
  );
};

export default SettingsPage;