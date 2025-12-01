import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../../styles/gupta/VideoSession.css';

const socket = io("http://localhost:3001");

const UserVideo = () => {
  const [updates, setUpdates] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    // Listen for broadcast
    socket.on("receive_video", (data) => {
        // Add new video to top of list
        setUpdates(prev => [data, ...prev]);
        
        // Auto-play the newest one if nothing is playing
        if(!currentVideo) setCurrentVideo(data);
        
        // Optional: Browser notification
        if(Notification.permission === "granted") {
            new Notification("New Advisor Update", { body: data.title });
        }
    });

    return () => socket.off("receive_video");
  }, [currentVideo]);

  return (
    <div className="video-session-page">
      <header className="video-header">
        <nav><Link to="/user/dashboard">Dashboard</Link> <span>Advisor Updates</span></nav>
        <div style={{color:'#10b981'}}>● Live Feed Active</div>
      </header>

      <div className="session-wrapper" style={{gridTemplateColumns:'2fr 1fr'}}>
        
        {/* Main Player Area */}
        <main className="session-main">
          <div className="video-container" style={{height:'100%', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'12px', overflow:'hidden'}}>
             {currentVideo ? (
                 <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column'}}>
                     <video src={currentVideo.url} controls autoPlay style={{flex:1, width:'100%', objectFit:'contain'}} />
                     <div style={{padding:'20px', background:'#1e293b'}}>
                        <h2 style={{margin:0, color:'white'}}>{currentVideo.title}</h2>
                        <span style={{color:'#94a3b8', fontSize:'0.9rem'}}>Posted at {currentVideo.timestamp}</span>
                     </div>
                 </div>
             ) : (
                 <div style={{textAlign:'center', color:'#666'}}>
                     <i className="fa-solid fa-film" style={{fontSize:'3rem', marginBottom:'15px'}}></i>
                     <h3>No updates selected</h3>
                     <p>Select a video from the list or wait for a new broadcast.</p>
                 </div>
             )}
          </div>
        </main>

        {/* Sidebar Feed */}
        <aside className="session-sidebar">
           <div className="sidebar-tabs">
              <div className="tab-link active">Recent Updates</div>
           </div>

           <div className="tab-content" style={{overflowY:'auto'}}>
              {updates.length === 0 && (
                  <div style={{textAlign:'center', padding:'20px', color:'#666'}}>
                      <p>No live updates yet.</p>
                  </div>
              )}

              {updates.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setCurrentVideo(item)}
                    style={{
                        padding:'15px', 
                        marginBottom:'10px', 
                        background: currentVideo?.id === item.id ? '#2563eb' : '#334155',
                        borderRadius:'8px', 
                        cursor:'pointer',
                        transition:'background 0.2s'
                    }}
                  >
                      <div style={{fontWeight:'bold', color:'white', marginBottom:'5px'}}>{item.title}</div>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color: currentVideo?.id === item.id ? '#cbd5e1' : '#94a3b8'}}>
                          <span><i className="fa-solid fa-clock"></i> {item.timestamp}</span>
                          <span>Advisor</span>
                      </div>
                  </div>
              ))}
           </div>
        </aside>
      </div>
    </div>
  );
};

export default UserVideo;