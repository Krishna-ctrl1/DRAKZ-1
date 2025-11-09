import React from 'react';
import { Title, Subtitle } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';
// We can reuse the table styles from the UserTable for consistency
import { StyledTable, ActionButton, UserTableContainer } from '../../../styles/ziko/admin/UserTable.styles';

// Mock data for demonstration
const dummyPendingBlogs = [
  { id: 'p1', title: 'My First Investment', author: 'user@example.com', submitted: '2025-11-09' },
  { id: 'p2', title: 'Understanding ETFs', author: 'jane@example.com', submitted: '2025-11-08' },
];

const dummyPublishedBlogs = [
  { id: 'b1', title: 'Why You Need a FinBot', author: 'advisor@example.com', published: '2025-11-05' },
  { id: 'b2', title: 'Top 5 Stocks for Q4', author: 'admin@example.com', published: '2025-11-01' },
];

const ContentManagementPage = () => {
  // Placeholder functions for actions
  const handleApprove = (id) => console.log('Approve blog:', id);
  const handleReject = (id) => console.log('Reject blog:', id);
  const handleRead = (id) => console.log('Read blog:', id);
  const handleRemove = (id) => console.log('Remove blog:', id);

  return (
    <>
      <Title>Content Management (Blogs)</Title>

      {/* Section for Pending Blogs */}
      <Section>
        <UserTableContainer> {/* Reusing this container for the nice box style */}
          <Subtitle style={{ padding: '24px 24px 0' }}>Pending Approval</Subtitle>
          <StyledTable>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyPendingBlogs.map((blog) => (
                <tr key={blog.id}>
                  <td>{blog.title}</td>
                  <td>{blog.author}</td>
                  <td>{blog.submitted}</td>
                  <td>
                    <ActionButton onClick={() => handleApprove(blog.id)}>Approve</ActionButton>
                    <ActionButton secondary onClick={() => handleReject(blog.id)}>Reject</ActionButton>
                    <ActionButton secondary onClick={() => handleRead(blog.id)}>Read</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </UserTableContainer>
      </Section>

      {/* Section for Published Blogs */}
      <Section>
        <UserTableContainer>
          <Subtitle style={{ padding: '24px 24px 0' }}>Published Blogs</Subtitle>
          <StyledTable>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyPublishedBlogs.map((blog) => (
                <tr key={blog.id}>
                  <td>{blog.title}</td>
                  <td>{blog.author}</td>
                  <td>{blog.published}</td>
                  <td>
                    <ActionButton secondary onClick={() => handleRead(blog.id)}>Read</ActionButton>
                    <ActionButton secondary onClick={() => handleRemove(blog.id)}>Remove</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </UserTableContainer>
      </Section>
    </>
  );
};

export default ContentManagementPage;