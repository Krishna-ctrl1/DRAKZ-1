import React, { useState, useEffect } from "react";
import BlogControls from "./BlogControls";
import BlogList from "./BlogList";
import "../../styles/ragamaie/BlogList.css"; 

// --- STYLES MATCHING YOUR 'BlogCard.css' & DARK THEME ---
const styles = {
  tabContainer: {
    display: 'flex',
    gap: '30px',
    marginBottom: '20px',
    borderBottom: '1px solid #2b2b40',
    paddingBottom: '0px'
  },
  tabBtn: (isActive) => ({
    background: 'none',
    border: 'none',
    borderBottom: isActive ? '3px solid #6C63FF' : '3px solid transparent',
    color: isActive ? '#fff' : '#888',
    padding: '10px 5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.3s ease'
  }),
  card: {
    backgroundColor: '#1c1c2b', 
    borderRadius: '20px',       
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    color: '#fff',
    border: '1px solid #2a2a3d', 
    position: 'relative',
    overflow: 'hidden' 
  },
  statusBadge: (status) => ({
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: status === 'approved' ? 'rgba(0, 230, 118, 0.1)' : 
                     status === 'rejected' ? 'rgba(255, 82, 82, 0.1)' : 
                     'rgba(255, 167, 38, 0.1)',
    color: status === 'approved' ? '#00e676' : 
           status === 'rejected' ? '#ff5252' : 
           '#ffa726',
    border: `1px solid ${
      status === 'approved' ? '#00e676' : 
      status === 'rejected' ? '#ff5252' : 
      '#ffa726'
    }`
  }),
  rejectionBox: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: 'rgba(255, 82, 82, 0.08)', 
    borderLeft: '3px solid #ff5252',
    color: '#ff867c',
    fontSize: '0.9rem',
    borderRadius: '4px'
  },
  statusStrip: (status) => ({
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '5px',
    backgroundColor: status === 'approved' ? '#00e676' : 
                     status === 'rejected' ? '#ff5252' : 
                     '#ffa726'
  }),
  editBtn: {
    backgroundColor: '#6C63FF', 
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.2s'
  }
};

const BlogSection = () => {
  const [activeTab, setActiveTab] = useState("community"); 
  
  // Data States
  const [communityBlogs, setCommunityBlogs] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  
  // Filtered States (For Search)
  const [filteredCommunity, setFilteredCommunity] = useState([]);
  const [filteredMyBlogs, setFilteredMyBlogs] = useState([]); // <--- NEW STATE

  const [blogToEdit, setBlogToEdit] = useState(null); 

  // FETCH PUBLIC
  const fetchCommunity = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/blogs"); 
      if(res.ok) {
        const data = await res.json();
        setCommunityBlogs(data);
        setFilteredCommunity(data); // Initialize filtered list
      }
    } catch (e) { console.error(e); }
  };

  // FETCH MY BLOGS
  const fetchMyBlogs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:3001/api/blogs/my-blogs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyBlogs(data);
        setFilteredMyBlogs(data); // Initialize filtered list
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchCommunity();
    fetchMyBlogs();
  }, []);

  const handleBlogSuccess = () => {
    fetchCommunity();
    fetchMyBlogs();
    setBlogToEdit(null); 
    setActiveTab("myBlogs"); 
  };

  // --- UPDATED SEARCH FUNCTION ---
  const handleSearch = (query) => { 
    const lowerQuery = query ? query.toLowerCase() : "";

    // Filter Community
    if (!query) setFilteredCommunity(communityBlogs);
    else setFilteredCommunity(communityBlogs.filter(b => b.title.toLowerCase().includes(lowerQuery)));

    // Filter My Blogs (Added this part)
    if (!query) setFilteredMyBlogs(myBlogs);
    else setFilteredMyBlogs(myBlogs.filter(b => b.title.toLowerCase().includes(lowerQuery)));
  };

  return (
    <div className="blog-section">
      {/* CONTROLS */}
      <BlogControls 
        onSearch={handleSearch} 
        onBlogCreated={handleBlogSuccess}
        editingBlog={blogToEdit} 
        onCancelEdit={() => setBlogToEdit(null)}
      />

      {/* TABS */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setActiveTab("community")}
          style={styles.tabBtn(activeTab === "community")}
        >
          Community Feed
        </button>
        <button 
          onClick={() => setActiveTab("myBlogs")}
          style={styles.tabBtn(activeTab === "myBlogs")}
        >
          My Blogs
        </button>
      </div>

      {/* VIEW: COMMUNITY */}
      {activeTab === "community" && (
        <BlogList blogs={filteredCommunity} />
      )}

      {/* VIEW: MY BLOGS */}
      {activeTab === "myBlogs" && (
        <div className="my-blogs-list">
          {filteredMyBlogs.length === 0 ? ( // Use filteredMyBlogs here
            <div style={{textAlign:'center', color:'#888', marginTop:'40px'}}>
              <p>{myBlogs.length === 0 ? "You haven't posted any blogs yet." : "No blogs match your search."}</p>
            </div>
          ) : (
            filteredMyBlogs.map(blog => ( // Map over filteredMyBlogs
              <div key={blog._id} style={styles.card}>
                
                {/* Colored Status Strip on the Left */}
                <div style={styles.statusStrip(blog.status)} />

                {/* Header: Title + Status */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', paddingLeft:'10px'}}>
                  <h2 style={{margin:0, fontSize:'1.2rem', color:'#fff', fontWeight:'600'}}>{blog.title}</h2>
                  <span style={styles.statusBadge(blog.status)}>
                    {blog.status}
                  </span>
                </div>

                {/* Metadata */}
                <p style={{ margin: '0 0 15px 10px', fontSize: '0.85rem', color: '#888' }}>
                   {new Date(blog.createdAt).toLocaleDateString()}
                </p>

                {/* Rejection Reason Box */}
                {blog.status === 'rejected' && blog.rejection_reason && (
                  <div style={{...styles.rejectionBox, marginLeft:'10px'}}>
                    <strong>⚠️ Rejection Reason:</strong> {blog.rejection_reason}
                  </div>
                )}

                {/* Content Preview */}
                <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem', paddingLeft:'10px', marginTop: '10px' }}>
                  {blog.content.length > 200 ? blog.content.substring(0, 200) + "..." : blog.content}
                </p>

                {/* Edit Button */}
                <div style={{paddingLeft: '10px'}}>
                   <button 
                     onClick={() => { setBlogToEdit(blog); window.scrollTo(0,0); }}
                     style={styles.editBtn}
                     onMouseOver={(e) => e.target.style.opacity = '0.9'}
                     onMouseOut={(e) => e.target.style.opacity = '1'}
                   >
                     ✏️ Edit & Resubmit
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BlogSection;