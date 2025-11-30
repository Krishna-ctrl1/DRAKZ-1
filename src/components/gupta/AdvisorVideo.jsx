import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchClients, selectClient } from '../../redux/slices/advisorSlice';
import '../../styles/gupta/VideoSession.css';

const AdvisorVideo = () => {
  const dispatch = useDispatch();
  // Fetch real clients from Redux
  const { clients, selectedClient } = useSelector((state) => state.advisor);
  
  const [activeTab, setActiveTab] = useState('clients');
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const localVideoRef = useRef(null);

  useEffect(() => {
    // If we reloaded this page, we might not have clients yet
    if (clients.length === 0) {
      dispatch(fetchClients());
    }
    
    // Camera setup
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera Error:", err);
      }
    };
    startCamera();
  }, [clients.length, dispatch]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages([...messages, { sender: 'You', text: inputMsg }]);
    setInputMsg('');
  };

  return (
    <div className="video-session-page">
      <header>
        <nav>
          <Link to="/advisor/dashboard">Your Clients</Link>
          <Link to="/advisor/video" className="active">Session Room</Link>
        </nav>
        <div className="header-right">Advisor View</div>
      </header>

      <div className="session-wrapper">
        <main className="session-main">
          <div className="session-header">
            <h3>Session with: <span style={{color: '#3b82f6'}}>
              {selectedClient ? selectedClient.name : "Select a Client"}
            </span></h3>
            <button id="end-session-btn">End Session</button>
          </div>
          
          <div className="video-container">
            <div className="shared-player">
              <iframe 
                src="https://www.youtube.com/embed/Cda-fUJ-GjE" 
                title="Advisor Screen" 
                frameBorder="0" 
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="video-chat">
              <div className="video-box advisor-video">
                <video ref={localVideoRef} autoPlay muted playsInline style={{width: '100%', height:'100%', objectFit: 'cover'}}></video>
                <p className="video-label">You</p>
              </div>
              <div className="video-box client-video" style={{background: '#222'}}>
                <p style={{color:'#666'}}>Waiting for {selectedClient ? selectedClient.name : 'Client'}...</p>
              </div>
            </div>
          </div>

          <div className="chat-container">
            <h4>Live Chat</h4>
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} style={{marginBottom: '5px'}}>
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </main>

        <aside className="session-sidebar">
          <div className="sidebar-tabs">
            <button className={`tab-link ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>Clients</button>
            <button className={`tab-link ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notes</button>
          </div>
          
          {/* REAL CLIENT LIST FROM REDUX */}
          {activeTab === 'clients' && (
            <div className="tab-content active">
              <h4>Start Session With:</h4>
              <ul style={{listStyle: 'none', padding: 0}}>
                {clients.map(client => (
                  <li 
                    key={client._id}
                    style={{
                      padding: '10px', 
                      borderBottom: '1px solid rgba(255,255,255,0.1)', 
                      cursor:'pointer',
                      background: selectedClient?._id === client._id ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                    }}
                    onClick={() => dispatch(selectClient(client))}
                  >
                    {client.name || client.email}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="tab-content active">
              <h4>Session Notes</h4>
              <textarea 
                id="notes-area" 
                placeholder="Private notes for this session..."
                style={{width: '100%', height: '150px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', padding: '10px'}}
              ></textarea>
              <button id="save-notes-btn">Save Note</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdvisorVideo;