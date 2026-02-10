import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../../config/backend';
import { Title, Subtitle } from '../../../styles/ziko/admin/SharedStyles';
import { Section } from '../../../styles/ziko/admin/AdminLayout.styles';
import { StyledTable, ActionButton, UserTableContainer } from '../../../styles/ziko/admin/UserTable.styles';
import { MdFlag, MdCheckCircle, MdDelete, MdUndo, MdRemoveCircle } from 'react-icons/md';

// --- DARK THEME MODAL STYLES ---
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
  display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
};

const modalContentStyle = {
  backgroundColor: '#1e1e2f', color: '#ffffff', padding: '30px', borderRadius: '12px',
  width: '90%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #2b2b40'
};

const blogBodyStyle = {
  marginTop: '20px', padding: '25px', backgroundColor: '#151521', borderRadius: '8px',
  lineHeight: '1.8', fontSize: '1rem', color: '#dcdcdc', whiteSpace: 'pre-wrap',
  overflowY: 'auto', flex: 1, border: '1px solid #2b2b40'
};

const closeButtonStyle = {
  marginTop: '20px', padding: '10px 25px', backgroundColor: '#2b2b40', color: '#fff',
  border: '1px solid #3f3f50', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
};

const ContentManagementPage = () => {
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [rejectedBlogs, setRejectedBlogs] = useState([]);
  const [flaggedBlogs, setFlaggedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const getToken = () => localStorage.getItem("token");
  const API_URL = `${BACKEND_URL}/api/blogs`;

  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      const headers = { "Authorization": `Bearer ${token}` };

      const [pendingRes, approvedRes, rejectedRes, flaggedRes] = await Promise.all([
        fetch(`${API_URL}/admin/list?status=pending`, { headers }),
        fetch(`${API_URL}/admin/list?status=approved`, { headers }),
        fetch(`${API_URL}/admin/list?status=rejected`, { headers }),
        fetch(`${API_URL}/admin/list?isFlagged=true`, { headers })
      ]);

      if (pendingRes.ok) setPendingBlogs(await pendingRes.json());
      if (approvedRes.ok) setPublishedBlogs(await approvedRes.json());
      if (rejectedRes.ok) setRejectedBlogs(await rejectedRes.json());
      if (flaggedRes.ok) setFlaggedBlogs(await flaggedRes.json());
      setLoading(false);
    } catch (error) {
      console.error("Error loading admin data:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- ACTIONS ---
  const changeStatus = async (blogId, newStatus, reason = "") => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/${blogId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, reason })
      });
      if (res.ok) {
        // Optimistic Update
        if (newStatus === 'approved') {
          setPendingBlogs(prev => prev.filter(b => b._id !== blogId));
        } else if (newStatus === 'rejected') {
          setPendingBlogs(prev => prev.filter(b => b._id !== blogId));
          setPublishedBlogs(prev => prev.filter(b => b._id !== blogId));
        } else if (newStatus === 'pending') {
          setPublishedBlogs(prev => prev.filter(b => b._id !== blogId));
        }

        if (selectedBlog?._id === blogId) setSelectedBlog(null);
        fetchData(); // Background sync
      } else alert("Failed to update status.");
    } catch (e) { console.error(e); }
  };

  const handleReject = async (blogId) => {
    const reason = window.prompt("Reason for rejection?");
    if (!reason) return;
    await changeStatus(blogId, 'rejected', reason);
  };

  const toggleFlag = async (blogId, isFlagged) => {
    const reason = isFlagged ? window.prompt("Reason for flagging?") : "";
    if (isFlagged && !reason) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/${blogId}/flag`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ isFlagged, reason })
      });
      if (res.ok) {
        // Optimistic Update for Flagging
        if (isFlagged) {
          // Add to flagged list assuming we can find it in published
          const blog = publishedBlogs.find(b => b._id === blogId);
          if (blog) setFlaggedBlogs(prev => [...prev, { ...blog, isFlagged: true, flagReason: reason }]);
        } else {
          // Remove from flagged list
          setFlaggedBlogs(prev => prev.filter(b => b._id !== blogId));
        }
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Permanently delete this blog?")) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/${blogId}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingBlogs(prev => prev.filter(b => b._id !== blogId));
        setPublishedBlogs(prev => prev.filter(b => b._id !== blogId));
        setRejectedBlogs(prev => prev.filter(b => b._id !== blogId));
        setFlaggedBlogs(prev => prev.filter(b => b._id !== blogId));
        if (selectedBlog?._id === blogId) setSelectedBlog(null);
      }
    } catch (e) { console.error(e); }
  };

  const renderAuthor = (author) => author?.name || author?.email || "Unknown";

  if (loading) return <div style={{ padding: "20px", color: "#fff" }}>Loading...</div>;

  return (
    <>
      <Title>Content Management</Title>

      {/* --- MODAL --- */}
      {selectedBlog && (
        <div style={modalOverlayStyle} onClick={() => setSelectedBlog(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ borderBottom: '1px solid #2b2b40', paddingBottom: '15px' }}>
              <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>{selectedBlog.title}</h2>
              <div style={{ display: 'flex', gap: '15px', color: '#a0a0b0', fontSize: '0.9rem' }}>
                <span><strong>Author:</strong> {renderAuthor(selectedBlog.author_id)}</span>
                <span><strong>Date:</strong> {new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
                <span>
                  <strong>Status:</strong>
                  <span style={{ marginLeft: '5px', color: selectedBlog.status === 'approved' ? '#00e676' : '#ffb74d' }}>
                    {selectedBlog.status}
                  </span>
                </span>
                {selectedBlog.isFlagged && <span style={{ color: '#ff5252', fontWeight: 'bold' }}>[FLAGGED]</span>}
              </div>
            </div>
            <div style={blogBodyStyle}>{selectedBlog.content}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={closeButtonStyle} onClick={() => setSelectedBlog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FLAGGED CONTENT (Priority) */}
      {flaggedBlogs.length > 0 && (
        <Section>
          <UserTableContainer style={{ border: '1px solid #ef4444' }}>
            <Subtitle style={{ padding: '20px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MdFlag /> Flagged Content (Needs Review)
            </Subtitle>
            <StyledTable>
              <thead><tr><th>Title</th><th>Author</th><th>Reason</th><th>Actions</th></tr></thead>
              <tbody>
                {flaggedBlogs.map(b => (
                  <tr key={b._id}>
                    <td>{b.title}</td><td>{renderAuthor(b.author_id)}</td>
                    <td style={{ color: '#ef4444', fontStyle: 'italic' }}>{b.flagReason}</td>
                    <td>
                      <ActionButton onClick={() => setSelectedBlog(b)} style={{ backgroundColor: '#17a2b8', color: '#fff' }}>View</ActionButton>
                      <ActionButton onClick={() => toggleFlag(b._id, false)} style={{ backgroundColor: '#10b981', color: '#fff' }}>Unflag</ActionButton>
                      <ActionButton $secondary onClick={() => handleDelete(b._id)}>Delete</ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </UserTableContainer>
        </Section>
      )}

      {/* 1. PENDING */}
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
                    <ActionButton onClick={() => setSelectedBlog(b)} style={{ backgroundColor: '#17a2b8', color: '#fff' }}>View</ActionButton>
                    <ActionButton onClick={() => changeStatus(b._id, 'approved')}><MdCheckCircle /> Approve</ActionButton>
                    <ActionButton $secondary onClick={() => handleReject(b._id)}><MdRemoveCircle /> Reject</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </UserTableContainer>
      </Section>

      {/* 2. PUBLISHED */}
      <Section>
        <UserTableContainer>
          <Subtitle style={{ padding: '20px' }}>Published Content</Subtitle>
          <StyledTable>
            <thead><tr><th>Title</th><th>Author</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {publishedBlogs.map(b => (
                <tr key={b._id}>
                  <td>{b.title}</td><td>{renderAuthor(b.author_id)}</td><td>{new Date(b.published_at).toLocaleDateString()}</td>
                  <td>
                    <ActionButton onClick={() => setSelectedBlog(b)} style={{ backgroundColor: '#17a2b8', color: '#fff' }}>View</ActionButton>
                    <ActionButton onClick={() => toggleFlag(b._id, true)} style={{ color: '#ef4444', borderColor: '#ef4444' }} $secondary>
                      <MdFlag /> Flag
                    </ActionButton>
                    <ActionButton $secondary onClick={() => handleDelete(b._id)}><MdDelete /> Remove</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </UserTableContainer>
      </Section>

      {/* 3. REJECTED */}
      <Section>
        <UserTableContainer>
          <Subtitle style={{ padding: '20px', opacity: 0.7 }}>Rejected Archive</Subtitle>
          <StyledTable>
            <thead><tr><th>Title</th><th>Author</th><th>Reason</th><th>Actions</th></tr></thead>
            <tbody>
              {rejectedBlogs.map(b => (
                <tr key={b._id} style={{ opacity: 0.6 }}>
                  <td>{b.title}</td><td>{renderAuthor(b.author_id)}</td><td>{b.rejection_reason}</td>
                  <td>
                    <ActionButton onClick={() => changeStatus(b._id, 'approved')}><MdUndo /> Restore</ActionButton>
                    <ActionButton $secondary onClick={() => handleDelete(b._id)}>Delete</ActionButton>
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