import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { fetchClients, selectClient } from '../../redux/slices/advisorSlice';
import '../../styles/gupta/VideoSession.css';

const socket = io("http://localhost:3001");

// Expanded Video Library
const VIDEO_LIBRARY = [
  { id: 1, title: "Market Outlook 2025", url: "https://www.youtube.com/embed/Cda-fUJ-GjE" },
  { id: 2, title: "Retirement Planning 101", url: "https://www.youtube.com/embed/PHe0bXAIuk0" },
  { id: 3, title: "Crypto Risks Explained", url: "https://www.youtube.com/embed/N9T4M0wT7pI" },
  { id: 4, title: "Understanding SIPs", url: "https://www.youtube.com/embed/3vj6YQJ7q74" },
  { id: 5, title: "Tax Saving Strategies", url: "https://www.youtube.com/embed/t8k71Q_7a4E" },
  { id: 6, title: "Gold vs Equity", url: "https://www.youtube.com/embed/5yX2y8x8q8Q" }
];

const AdvisorVideo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clients, selectedClient } = useSelector((state) => state.advisor);
  
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    { id: 1, text: "System: Session Started. Waiting for client...", sender: 'sys' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [note, setNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(VIDEO_LIBRARY[0].url);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  // Fetch Clients on Load
  useEffect(() => {
    if (clients.length === 0) dispatch(fetchClients());
  }, [dispatch, clients.length]);

  // Join Client Room
  useEffect(() => {
    if (selectedClient) {
      const saved = localStorage.getItem(`note_${selectedClient._id}`);
      if (saved) setNote(saved);
      socket.emit("join_room", selectedClient._id);
    }
  }, [selectedClient]);

  // Camera Setup
  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (e) { console.error("Cam Error", e); }
    };
    startCam();

    socket.on("receive_message", (data) => setMessages(prev => [...prev, data]));
    
    // Cleanup on unmount
    return () => {
       socket.off("receive_message");
       stopCamera(); // Ensure camera turns off
    };
  }, []);

  // --- HARD STOP CAMERA FUNCTION ---
  const stopCamera = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
            track.stop(); // This physically turns off the camera light
        });
        localVideoRef.current.srcObject = null;
    }
  };

  const handleEndSession = () => {
    if (window.confirm("End Session and turn off camera?")) {
      stopCamera(); // <--- Call the stop function
      socket.emit("end_call", { room: selectedClient?._id });
      navigate('/advisor/dashboard');
    }
  };

  // Chat & Note Handlers
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedClient) return;
    const msg = { room: selectedClient._id, text: inputMsg, sender: 'Advisor' };
    socket.emit("send_message", msg);
    setMessages(prev => [...prev, { ...msg, sender: 'me' }]);
    setInputMsg('');
  };

  const handleSaveNote = () => {
    if (!selectedClient) return alert("Select a client first!");
    localStorage.setItem(`note_${selectedClient._id}`, note);
    alert("Note Saved!");
  };

  const toggleRecording = () => {
    if (isRecording) {
      if(mediaRecorder.current) mediaRecorder.current.stop();
      setIsRecording(false);
    } else {
      // Record whatever is in the local stream (Advisor)
      const stream = localVideoRef.current?.srcObject;
      if (!stream) return alert("No camera to record.");
      
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Session_${selectedClient?.name || 'Rec'}.webm`;
        a.click();
        recordedChunks.current = [];
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    }
  };

  return (
    <div className="video-session-page">
      <header className="video-header">
        <nav>
          <Link to="/advisor/dashboard">Dashboard</Link>
          <span style={{color:'white'}}>Live Session</span>
        </nav>
        <div className="header-right">ADVISOR</div>
      </header>

      <div className="session-wrapper">
        <main className="session-main">
          <div className="session-header">
            <h3>Client: <span style={{color:'#3b82f6'}}>{selectedClient?.name || "Waiting..."}</span></h3>
            <div style={{display:'flex', gap:'10px'}}>
              <button className={`btn-control ${isRecording ? 'recording' : ''}`} onClick={toggleRecording}>
                {isRecording ? "Stop & Save" : "Record Session"}
              </button>
              <button id="end-session-btn" onClick={handleEndSession}>End Session</button>
            </div>
          </div>

          <div className="video-container">
            <div className="shared-player">
              <iframe src={`${currentVideo}?autoplay=1&mute=1`} title="share" allowFullScreen></iframe>
            </div>
            <div className="video-chat">
              <div className="video-box">
                <video ref={localVideoRef} autoPlay muted playsInline></video>
                <p>You</p>
              </div>
              <div className="video-box" style={{background:'#111', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{position:'static', color:'#666'}}>Client Camera</p>
              </div>
            </div>
          </div>
        </main>

        <aside className="session-sidebar">
          <div className="sidebar-tabs">
            <button className={`tab-link ${activeTab==='chat'?'active':''}`} onClick={()=>setActiveTab('chat')}>Chat</button>
            <button className={`tab-link ${activeTab==='videos'?'active':''}`} onClick={()=>setActiveTab('videos')}>Videos</button>
            <button className={`tab-link ${activeTab==='notes'?'active':''}`} onClick={()=>setActiveTab('notes')}>Notes</button>
          </div>

          {activeTab === 'chat' && (
            <div className="tab-content">
              <div className="chat-container">
                <div className="chat-messages">
                  {messages.map((m,i)=><div key={i} className={`message ${m.sender==='me'?'me':'them'}`}>{m.text}</div>)}
                </div>
                <form className="chat-input" onSubmit={handleSend}>
                  <input value={inputMsg} onChange={e=>setInputMsg(e.target.value)} placeholder="Type..." />
                  <button>Send</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="tab-content">
              {VIDEO_LIBRARY.map(v => (
                <div key={v.id} className="video-list-item" onClick={() => setCurrentVideo(v.url)}>
                  <span style={{color:'red', marginRight:'8px'}}>▶</span> {v.title}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="tab-content">
              <textarea id="notes-area" value={note} onChange={e=>setNote(e.target.value)} placeholder="Session notes..."></textarea>
              <button className="save-btn" onClick={handleSaveNote}>Save Note</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdvisorVideo;