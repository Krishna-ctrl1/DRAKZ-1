import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { fetchClients } from '../../redux/slices/advisorSlice';
import '../../styles/gupta/VideoSession.css';

const socket = io("http://localhost:3001");

// --- RESTORED: Video Library ---
const VIDEO_LIBRARY = [
  { id: 1, title: "Market Outlook 2025", url: "https://www.youtube.com/embed/Cda-fUJ-GjE" },
  { id: 2, title: "Retirement Planning", url: "https://www.youtube.com/embed/PHe0bXAIuk0" },
  { id: 3, title: "Crypto Risks", url: "https://www.youtube.com/embed/N9T4M0wT7pI" },
  { id: 4, title: "SIP Strategy", url: "https://www.youtube.com/embed/3vj6YQJ7q74" },
];

const AdvisorVideo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clients, selectedClient } = useSelector((state) => state.advisor);
  
  // State for Tabs & Chat
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  
  // State for Features
  const [note, setNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [viewMode, setViewMode] = useState('call'); // 'call' or 'youtube'
  const [currentVideo, setCurrentVideo] = useState(VIDEO_LIBRARY[0].url);
  const [status, setStatus] = useState('Idle');
  const [camError, setCamError] = useState(null);

  // References
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  // 1. Fetch Clients if missing
  useEffect(() => {
    if (clients.length === 0) dispatch(fetchClients());
  }, [dispatch, clients.length]);

  // 2. Start Local Camera (With Busy Check)
  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.muted = true; // Mute self
        }
        setCamError(null);
      } catch (e) {
        console.error("Camera Error:", e);
        if (e.name === "NotReadableError" || e.name === "TrackStartError") {
            setCamError("Camera Busy! (Close User tab if on 1 Laptop)");
        } else {
            setCamError("Camera Blocked/Denied");
        }
      }
    };
    startCam();

    // Socket Listeners
    socket.on("receive_message", (data) => setMessages(p => [...p, data]));
    
    socket.on("answer", async (answer) => {
        setStatus("Client Connected");
        if (peerConnection.current) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
    });

    socket.on("ice-candidate", async (c) => {
        if(peerConnection.current) await peerConnection.current.addIceCandidate(new RTCIceCandidate(c));
    });

    return () => {
        socket.off("receive_message"); socket.off("answer"); socket.off("ice-candidate");
        if(localVideoRef.current?.srcObject) localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
        if(peerConnection.current) peerConnection.current.close();
    };
  }, []);

  // 3. Join Room (CRITICAL FIX: Ensure Client Exists)
  useEffect(() => {
    if (selectedClient) {
        console.log(`Advisor joining room: ${selectedClient._id}`);
        socket.emit("join_room", selectedClient._id);
        
        // Restore Note
        const saved = localStorage.getItem(`note_${selectedClient._id}`);
        if(saved) setNote(saved);
        setStatus(`Ready to call ${selectedClient.name}`);
    }
  }, [selectedClient]);

  // 4. Start Call Logic
  const startCall = async () => {
    if(!selectedClient) return alert("Error: No Client Selected. Go back to Dashboard.");
    setStatus("Calling...");
    setViewMode('call');

    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerConnection.current = pc;

    // Add Local Stream
    if(localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(t => pc.addTrack(t, localVideoRef.current.srcObject));
    }

    // Handle Remote Stream
    pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = (e) => {
        if(e.candidate) socket.emit("ice-candidate", { candidate: e.candidate, room: selectedClient._id });
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { offer, room: selectedClient._id });
  };

  // --- RESTORED FEATURE: Recording ---
  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      const stream = localVideoRef.current?.srcObject;
      if (!stream) return alert("Camera not active");
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if(e.data.size > 0) recordedChunks.current.push(e.data); };
      recorder.onstop = () => {
         const blob = new Blob(recordedChunks.current, {type: 'video/webm'});
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a'); a.href=url; a.download=`session_${selectedClient?.name || 'rec'}.webm`; a.click();
         recordedChunks.current = [];
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    }
  };

  // --- RESTORED FEATURE: Save Notes ---
  const handleSaveNote = () => {
      if(!selectedClient) return alert("No client selected");
      localStorage.setItem(`note_${selectedClient._id}`, note);
      alert("Note Saved!");
  };

  // Chat
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedClient) return;
    const msg = { room: selectedClient._id, text: inputMsg, sender: 'Advisor' };
    socket.emit("send_message", msg);
    setMessages(p => [...p, { ...msg, sender: 'me' }]);
    setInputMsg('');
  };

  // Redirect if no client selected
  if (!selectedClient) {
    return (
      <div className="video-session-page" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{textAlign:'center', background:'#222', padding:'40px', borderRadius:'10px'}}>
           <h2 style={{color:'white'}}>No Client Selected</h2>
           <p style={{color:'#aaa', marginBottom:'20px'}}>You must select a client from the Dashboard to start a session.</p>
           <Link to="/advisor/dashboard" style={{padding:'10px 20px', background:'#2563eb', color:'white', textDecoration:'none', borderRadius:'5px'}}>Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="video-session-page">
      <header className="video-header">
        <nav>
            <Link to="/advisor/dashboard">Dashboard</Link>
            <span style={{color:'white'}}>Live Session</span>
        </nav>
        <div className="header-right">ADVISOR VIEW</div>
      </header>

      <div className="session-wrapper">
        <main className="session-main">
          <div className="session-header">
            <h3>Client: <span style={{color:'#3b82f6'}}>{selectedClient.name}</span></h3>
            <div style={{display:'flex', gap:'10px'}}>
               <button className="btn-control" onClick={startCall} style={{background:'#2563eb'}}>Start Call</button>
               <button className="btn-control" onClick={toggleRecording} style={{background: isRecording?'red':'#444'}}>
                 {isRecording ? "Stop Rec" : "Record"}
               </button>
               <button className="btn-control" onClick={() => setViewMode('youtube')}>Share Video</button>
            </div>
          </div>

          <div className="video-container">
            {/* MAIN AREA: Toggles between Client Video and YouTube */}
            <div className="shared-player">
               {viewMode === 'youtube' ? (
                  <iframe src={`${currentVideo}?autoplay=1`} title="yt" allowFullScreen style={{width:'100%', height:'100%', border:'none'}}></iframe>
               ) : (
                  <div style={{width:'100%', height:'100%', background:'#000', position:'relative'}}>
                      <video ref={remoteVideoRef} autoPlay playsInline style={{width:'100%', height:'100%', objectFit:'cover'}}></video>
                      <div style={{position:'absolute', top:10, left:10, color:'white', background:'rgba(0,0,0,0.5)', padding:5}}>{status}</div>
                  </div>
               )}
            </div>

            <div className="video-chat">
               {/* Advisor Local Video */}
               <div className="video-box" style={{border: camError ? '2px solid red' : 'none'}}>
                  {camError ? <p style={{color:'red', fontSize:'0.7rem', padding:5}}>{camError}</p> : 
                    <video ref={localVideoRef} autoPlay muted playsInline></video>
                  }
                  <p>You</p>
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

           {/* --- RESTORED: Video Library Tab --- */}
           {activeTab === 'videos' && (
              <div className="tab-content">
                 {VIDEO_LIBRARY.map(v => (
                    <div key={v.id} className="video-list-item" onClick={()=>{ setCurrentVideo(v.url); setViewMode('youtube'); }}>
                       <span>▶ {v.title}</span>
                    </div>
                 ))}
              </div>
           )}

           {/* --- RESTORED: Notes Tab --- */}
           {activeTab === 'notes' && (
             <div className="tab-content">
               <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Private session notes..." style={{width:'100%', height:'150px'}}></textarea>
               <button onClick={handleSaveNote} style={{marginTop:'10px', width:'100%', padding:'10px', background:'#10b981', color:'white', border:'none', borderRadius:'4px'}}>Save Note</button>
             </div>
           )}
        </aside>
      </div>
    </div>
  );
};

export default AdvisorVideo;