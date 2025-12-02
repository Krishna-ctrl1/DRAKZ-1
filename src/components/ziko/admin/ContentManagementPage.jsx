import React, { useEffect, useState } from 'react';
import { Title, Subtitle } from '../../../styles/ziko/admin/SharedStyles';
import { Section } from '../../../styles/ziko/admin/AdminLayout.styles';
import { StyledTable, ActionButton, UserTableContainer } from '../../../styles/ziko/admin/UserTable.styles';

// --- DARK THEME MODAL STYLES (Matching Screenshot) ---
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.8)', // Darker dim
  display: 'flex', justifyContent: 'center', alignItems: 'center', 
  zIndex: 1000, backdropFilter: 'blur(4px)'
};

const modalContentStyle = {
  backgroundColor: '#1e1e2f', // Dark Card Background
  color: '#ffffff',           
  padding: '30px', 
  borderRadius: '12px', 
  width: '90%', maxWidth: '800px', maxHeight: '85vh', 
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #2b2b40'
};

const blogBodyStyle = {
  marginTop: '20px', padding: '25px', backgroundColor: '#151521', // Inner Input Dark
  borderRadius: '8px', lineHeight: '1.8', fontSize: '1rem', color: '#dcdcdc', 
  whiteSpace: 'pre-wrap', overflowY: 'auto', flex: 1, border: '1px solid #2b2b40'
};

const closeButtonStyle = {
  alignSelf: 'flex-end', marginTop: '20px', padding: '10px 25px', 
  backgroundColor: '#2b2b40', color: '#fff', border: '1px solid #3f3f50', 
  borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
};

const ContentManagementPage = () => {
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [rejectedBlogs, setRejectedBlogs] = useState([]); // New State
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const getToken = () => localStorage.getItem("token");
  const API_URL = "http://localhost:3001/api/blogs"; 

  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      const headers = { "Authorization": `Bearer ${token}` };

      // Fetch all three statuses
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch(`${API_URL}/admin/list?status=pending`, { headers }),
        fetch(`${API_URL}/admin/list?status=approved`, { headers }),
        fetch(`${API_URL}/admin/list?status=rejected`, { headers })
      ]);

      if (pendingRes.ok) setPendingBlogs(await pendingRes.json());
      if (approvedRes.ok) setPublishedBlogs(await approvedRes.json());
      if (rejectedRes.ok) setRejectedBlogs(await rejectedRes.json());
      setLoading(false);
    } catch (error) {
      console.error("Error loading admin data:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- REJECT WITH REASON ---
  const handleReject = async (blogId) => {
    const reason = window.prompt("Reason for rejection?");
    if (reason === null) return; // Cancelled
    if (reason.trim() === "") return alert("Rejection reason is required.");
    await changeStatus(blogId, 'rejected', reason);
  };

  const changeStatus = async (blogId, newStatus, reason = "") => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/${blogId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, reason })
      });
      if (res.ok) {
        if (selectedBlog?._id === blogId) setSelectedBlog(null);
        fetchData(); 
      } else alert("Failed to update status.");
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (blogId) => {
    if(!window.confirm("Permanently delete?")) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/${blogId}`, {
         method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch(e) { console.error(e); }
  };

  const renderAuthor = (author) => author?.name || author?.email || "Unknown";

  if (loading) return <div style={{padding:"20px", color:"#fff"}}>Loading...</div>;

  return (
    <>
      <Title>Content Management</Title>

      {/* --- DARK MODAL --- */}
      {selectedBlog && (
        <div style={modalOverlayStyle} onClick={() => setSelectedBlog(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ borderBottom: '1px solid #2b2b40', paddingBottom: '15px' }}>
              <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>{selectedBlog.title}</h2>
              <div style={{ display: 'flex', gap: '15px', color: '#a0a0b0', fontSize: '0.9rem' }}>
                <span><strong>Author:</strong> {renderAuthor(selectedBlog.author_id)}</span>
                <span><strong>Date:</strong> {new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
                <span style={{ textTransform: 'capitalize' }}>
                  <strong>Status:</strong> 
                  <span style={{ marginLeft: '5px', color: selectedBlog.status === 'approved' ? '#00e676' : selectedBlog.status === 'rejected' ? '#ff5252' : '#ffb74d' }}>
                    {selectedBlog.status}
                  </span>
                </span>
              </div>
              {selectedBlog.status === 'rejected' && (
                <div style={{ marginTop: '10px', color: '#ff5252', fontSize: '0.9rem' }}>
                  <strong>Rejection Reason:</strong> {selectedBlog.rejection_reason}
                </div>
              )}
            </div>
            <div style={blogBodyStyle}>{selectedBlog.content}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={closeButtonStyle} onClick={() => setSelectedBlog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PENDING */}
      <Section>
        <UserTableContainer>
          <Subtitle style={{ padding: '20px' }}>Pending Approval</Subtitle>
          <StyledTable>
            <thead><tr><th>Title</th><th>Author</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {pendingBlogs.map(b => (
                <tr key={b._id}>
                  <td>{b.title}</td><td>{renderAuthor(b.author_id)}</td><td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>
                    <ActionButton onClick={() => setSelectedBlog(b)} style={{ backgroundColor: '#17a2b8', color: '#fff', marginRight: '5px' }}>View</ActionButton>
                    <ActionButton onClick={() => changeStatus(b._id, 'approved')}>Approve</ActionButton>
                    <ActionButton secondary onClick={() => handleReject(b._id)}>Reject</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </UserTableContainer>
      </Section>

      {/* REJECTED (New Section) */}
      <Section>
        <UserTableContainer>
          <Subtitle style={{ padding: '20px' }}>Rejected Blogs</Subtitle>
          <StyledTable>
            <thead><tr><th>Title</th><th>Author</th><th>Reason</th><th>Actions</th></tr></thead>
            <tbody>
              {rejectedBlogs.map(b => (
                <tr key={b._id}>
                  <td>{b.title}</td><td>{renderAuthor(b.author_id)}</td>
                  <td style={{color:'#ff5252'}}>{b.rejection_reason}</td>
                  <td>
                    <ActionButton onClick={() => setSelectedBlog(b)} style={{ backgroundColor: '#17a2b8', color: '#fff', marginRight: '5px' }}>View</ActionButton>
                    <ActionButton onClick={() => changeStatus(b._id, 'approved')}>Re-Approve</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </UserTableContainer>
      </Section>

      {/* PUBLISHED */}
      <Section>
        <UserTableContainer>
          <Subtitle style={{ padding: '20px' }}>Published Blogs</Subtitle>
          <StyledTable>
            <thead><tr><th>Title</th><th>Author</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {publishedBlogs.map(b => (
                <tr key={b._id}>
                  <td>{b.title}</td><td>{renderAuthor(b.author_id)}</td><td>{new Date(b.published_at).toLocaleDateString()}</td>
                  <td>
                    <ActionButton onClick={() => setSelectedBlog(b)} style={{ backgroundColor: '#17a2b8', color: '#fff', marginRight: '5px' }}>View</ActionButton>
                    <ActionButton secondary onClick={() => handleDelete(b._id)}>Remove</ActionButton>
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