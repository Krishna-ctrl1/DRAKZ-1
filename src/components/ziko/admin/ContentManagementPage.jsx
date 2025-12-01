import React, { useEffect, useState } from 'react';
import { Title, Subtitle } from '../../../styles/ziko/admin/SharedStyles';
import { Section } from '../../../styles/ziko/admin/AdminLayout.styles';
import { StyledTable, ActionButton, UserTableContainer } from '../../../styles/ziko/admin/UserTable.styles';

const ContentManagementPage = () => {
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get token
  const getToken = () => localStorage.getItem("token");

  // Fetch blogs
  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn("No token found! Admin panel requires login.");
        return;
      }

      const headers = { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const API_URL = "http://localhost:3001/api/blogs"; 

      console.log("Fetching pending blogs...");
      
      // 1. Fetch Pending
      const pendingRes = await fetch(`${API_URL}/admin/list?status=pending`, { headers });
      if (!pendingRes.ok) throw new Error(`Pending fetch failed: ${pendingRes.status}`);
      const pendingData = await pendingRes.json();
      setPendingBlogs(Array.isArray(pendingData) ? pendingData : []);

      // 2. Fetch Approved
      const approvedRes = await fetch(`${API_URL}/admin/list?status=approved`, { headers });
      if (!approvedRes.ok) throw new Error(`Approved fetch failed: ${approvedRes.status}`);
      const approvedData = await approvedRes.json();
      setPublishedBlogs(Array.isArray(approvedData) ? approvedData : []);

      setLoading(false);
    } catch (error) {
      console.error("Error loading admin data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Approve/Reject
  const handleStatusChange = async (blogId, newStatus) => {
    try {
      const token = getToken();
      const API_URL = "http://localhost:3001/api/blogs";

      const res = await fetch(`${API_URL}/admin/${blogId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Refresh the lists instantly
        fetchData();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) return <div style={{padding: "20px"}}>Loading Admin Panel...</div>;

  return (
    <>
      <Title>Content Management (Blogs)</Title>

      {/* PENDING SECTION */}
      <Section>
        <UserTableContainer>
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
              {pendingBlogs.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign:"center"}}>No pending blogs found</td></tr>
              ) : (
                pendingBlogs.map((blog) => (
                  <tr key={blog._id}>
                    <td>{blog.title}</td>
                    <td>{blog.author_id?.email || "User"}</td>
                    <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td>
                      <ActionButton onClick={() => handleStatusChange(blog._id, 'approved')}>Approve</ActionButton>
                      <ActionButton secondary onClick={() => handleStatusChange(blog._id, 'rejected')}>Reject</ActionButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </StyledTable>
        </UserTableContainer>
      </Section>

      {/* PUBLISHED SECTION */}
      <Section>
        <UserTableContainer>
          <Subtitle style={{ padding: '24px 24px 0' }}>Published Blogs</Subtitle>
          <StyledTable>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Published</th>
              </tr>
            </thead>
            <tbody>
              {publishedBlogs.map((blog) => (
                <tr key={blog._id}>
                  <td>{blog.title}</td>
                  <td>{blog.author_id?.email || "User"}</td>
                  <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
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