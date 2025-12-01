import React, { useEffect, useState } from 'react';
import { Title, Subtitle } from '../../../styles/ziko/admin/SharedStyles';
import { Section } from '../../../styles/ziko/admin/AdminLayout.styles';
import { StyledTable, ActionButton, UserTableContainer } from '../../../styles/ziko/admin/UserTable.styles';

const ContentManagementPage = () => {
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: Get Token safely
  const getToken = () => localStorage.getItem("token");

  const API_URL = "http://localhost:3001/api/blogs"; 

  // 1. FETCH DATA
  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn("No token found! Admin panel requires login.");
        setLoading(false);
        return;
      }

      const headers = { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      console.log("🔄 Fetching admin blog lists...");

      // Fetch Pending
      const pendingRes = await fetch(`${API_URL}/admin/list?status=pending`, { headers });
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingBlogs(Array.isArray(pendingData) ? pendingData : []);
      } else {
        console.error("Failed to fetch pending blogs:", pendingRes.status);
      }

      // Fetch Approved
      const approvedRes = await fetch(`${API_URL}/admin/list?status=approved`, { headers });
      if (approvedRes.ok) {
        const approvedData = await approvedRes.json();
        setPublishedBlogs(Array.isArray(approvedData) ? approvedData : []);
      } else {
        console.error("Failed to fetch published blogs:", approvedRes.status);
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Network Error loading admin data:", error);
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  // 2. HANDLE APPROVE / REJECT
  const handleStatusChange = async (blogId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this blog?`)) return;

    try {
      const token = getToken();
      if (!token) {
        alert("Authentication Error: You are not logged in.");
        return;
      }

      console.log(`Sending PATCH request to: ${API_URL}/admin/${blogId}/status`);

      const res = await fetch(`${API_URL}/admin/${blogId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      // Handle Response
      if (res.ok) {
        alert(`✅ Success! Blog has been ${newStatus}.`);
        fetchData(); // Refresh the tables instantly
      } else {
        // Try to get the error message from the server
        const errorData = await res.json();
        console.error("Server Error:", errorData);
        alert(`❌ Failed: ${res.status} - ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert(`❌ Network Error: Is the backend running? ${error.message}`);
    }
  };

 const handleDelete = async (blogId) => {
    if(!window.confirm("Are you sure you want to permanently delete this blog?")) return;

    try {
      const token = getToken();
      // We are trying the admin route. If this fails with 404, the route doesn't exist.
      const url = `${API_URL}/admin/${blogId}`;

      console.log(`[DEBUG] Deleting: ${url}`);

      const res = await fetch(url, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        alert("✅ Blog deleted successfully.");
        fetchData(); 
      } else {
        // 🔍 DEBUGGING: Read raw text to see if it's an HTML error page
        const text = await res.text();
        console.error("❌ Server Error Raw Text:", text);
        
        // Try to parse it as JSON, otherwise show the status
        try {
          const json = JSON.parse(text);
          alert(`Failed: ${json.message}`);
        } catch (e) {
          alert(`Error ${res.status}: The server returned a non-JSON response. Check the Console for details.`);
        }
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert(error.message);
    }
  };

  if (loading) return <div style={{padding: "20px"}}>Loading Admin Panel...</div>;

  return (
    <>
      <Title>Content Management (Blogs)</Title>

      {/* PENDING APPROVAL SECTION */}
      <Section>
        <UserTableContainer>
          <Subtitle style={{ padding: '24px 24px 0' }}>Pending Approval</Subtitle>
          <StyledTable>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Submitted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingBlogs.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign:"center", color: "#666"}}>No pending blogs found</td></tr>
              ) : (
                pendingBlogs.map((blog) => (
                  <tr key={blog._id}>
                    <td>{blog.title}</td>
                    {/* Safe check for author existence */}
                    <td>{blog.author_id?.email || blog.author_id?.name || "Unknown"}</td>
                    <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td>
                      <ActionButton onClick={() => handleStatusChange(blog._id, 'approved')}>
                        Approve
                      </ActionButton>
                      <ActionButton secondary onClick={() => handleStatusChange(blog._id, 'rejected')}>
                        Reject
                      </ActionButton>
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
                <th>Published Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {publishedBlogs.map((blog) => (
                <tr key={blog._id}>
                  <td>{blog.title}</td>
                  <td>{blog.author_id?.email || blog.author_id?.name || "Unknown"}</td>
                  <td>
                    {blog.published_at 
                      ? new Date(blog.published_at).toLocaleDateString() 
                      : new Date(blog.updatedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <ActionButton secondary onClick={() => handleDelete(blog._id)}>
                      Remove
                    </ActionButton>
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