import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../../styles/gupta/VideoSession.css';

const socket = io("http://localhost:3001");

const UserVideo = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const localVideoRef = useRef(null);

  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (e) { console.error("Cam error", e); }
    };
    startCam();

    // Join Room
    const userId = localStorage.getItem('userId');
    if (userId) socket.emit("join_room", userId);

    socket.on("receive_message", (data) => setMessages(prev => [...prev, data]));
    
    return () => {
        socket.off("receive_message");
        stopCamera(); // Auto-stop on unmount
    };
  }, []);

  // --- HARD STOP CAMERA ---
  const stopCamera = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        localVideoRef.current.srcObject = null;
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!inputMsg.trim() || !userId) return;
    const msg = { room: userId, text: inputMsg, sender: 'Client' };
    socket.emit("send_message", msg);
    setMessages(prev => [...prev, { ...msg, sender: 'me' }]);
    setInputMsg('');
  };

  const handleLeave = () => {
    if(window.confirm("Leave session?")) {
      stopCamera(); // <--- Stop tracks
      navigate('/user/dashboard');
    }
  };

  return (
    <div className="video-session-page">
      <header className="video-header">
        <nav>
          <Link to="/user/dashboard">Dashboard</Link>
          <Link to="/user/finbot">FinBot</Link>
          <Link to="/user/video" className="active">Live Advisor</Link>
        </nav>
        <div className="header-right">CLIENT VIEW</div>
      </header>

      <div className="session-wrapper" style={{gridTemplateColumns:'1fr'}}>
        <main className="session-main">
          <div className="session-header">
            <h3>Live Session</h3>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
               <span style={{ color: '#10b981', fontWeight: 'bold', fontSize:'0.9rem' }}>● Connected</span>
               <button id="end-session-btn" onClick={handleLeave}>Leave</button>
            </div>
          </div>
          
          <div className="video-container">
            <div className="shared-player">
              <iframe src="https://www.youtube.com/embed/Cda-fUJ-GjE?autoplay=1&mute=1" title="screen" allowFullScreen></iframe>
            </div>
            
            <div className="video-chat">
              <div className="video-box">
                <div style={{width:'100%', height:'100%', background:'#222', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{color:'#666'}}>Advisor Camera (Off)</span>
                </div>
              </div>
              <div className="video-box">
                <video ref={localVideoRef} autoPlay muted playsInline></video>
                <p>You</p>
              </div>
            </div>
          </div>

          <div className="chat-container user-chat-box">
             <div className="chat-messages">
                {messages.map((m,i)=><div key={i} className={`message ${m.sender==='me'?'me':'them'}`}>{m.text}</div>)}
             </div>
             <form className="chat-input" onSubmit={handleSend}>
                <input value={inputMsg} onChange={e=>setInputMsg(e.target.value)} placeholder="Message..." />
                <button>Send</button>
             </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserVideo;