import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../../styles/gupta/VideoSession.css';

const socket = io("http://localhost:3001");

const UserVideo = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [status, setStatus] = useState('Initializing...');
  const [camError, setCamError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  
  // Use stored ID
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

  useEffect(() => {
    // 1. Camera Init
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.muted = true; // Avoid echo
        }
        setCamError(null);
        setStatus("Waiting for Advisor call...");
      } catch (e) {
        console.error("Client Cam Error:", e);
        if (e.name === "NotReadableError") {
            setCamError("Camera Busy! (Close Advisor tab if on 1 PC)");
        } else {
            setCamError("Camera Access Denied");
        }
      }
    };
    startCam();

    // 2. Join Room (CRITICAL: Must match Advisor's selectedClient._id)
    if(userId) {
        socket.emit("join_room", userId);
        console.log("Client Joined Room:", userId);
    } else {
        setStatus("Error: Not Logged In");
    }

    // 3. Listeners
    socket.on("receive_message", (data) => setMessages(p => [...p, data]));

    socket.on("offer", async (offer) => {
      console.log("Call Received!");
      setStatus("Connecting...");
      
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      peerConnection.current = pc;

      if(localVideoRef.current?.srcObject) {
         localVideoRef.current.srcObject.getTracks().forEach(t => pc.addTrack(t, localVideoRef.current.srcObject));
      }

      pc.ontrack = (e) => {
         if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };

      pc.onicecandidate = (e) => {
         if(e.candidate) socket.emit("ice-candidate", { candidate: e.candidate, room: userId });
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { answer, room: userId });
      setStatus("Connected with Advisor");
    });

    socket.on("ice-candidate", async (c) => {
       if(peerConnection.current) await peerConnection.current.addIceCandidate(new RTCIceCandidate(c));
    });

    return () => {
       socket.off("receive_message"); socket.off("offer"); socket.off("ice-candidate");
       if(localVideoRef.current?.srcObject) localVideoRef.current.srcObject.getTracks().forEach(t=>t.stop());
       if(peerConnection.current) peerConnection.current.close();
    };
  }, [userId]);

  const handleSend = (e) => {
    e.preventDefault();
    if(!inputMsg.trim()) return;
    socket.emit("send_message", { room: userId, text: inputMsg, sender: 'Client' });
    setMessages(p => [...p, { text: inputMsg, sender: 'me' }]);
    setInputMsg('');
  };

  return (
    <div className="video-session-page" style={{height:'100vh', display:'flex', flexDirection:'column', background:'#0f172a', color:'white'}}>
      <header className="video-header" style={{padding:'15px', background:'#1e293b', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
         <nav style={{display:'flex', gap:'20px'}}>
            <Link to="/user/dashboard" style={{color:'#aaa', textDecoration:'none'}}>Dashboard</Link>
            <span style={{color:'#3b82f6', fontWeight:'bold'}}>Live Session</span>
         </nav>
         <div style={{fontSize:'0.8rem', color:'#aaa', border:'1px solid #444', padding:'2px 8px', borderRadius:'4px'}}>
            Your ID: {userId}
         </div>
      </header>

      <div className="session-wrapper" style={{flex:1, display:'grid', gridTemplateColumns:'3fr 1fr', padding:'20px', gap:'20px'}}>
         <main className="session-main" style={{background:'black', position:'relative', borderRadius:'10px', overflow:'hidden'}}>
             <video ref={remoteVideoRef} autoPlay playsInline style={{width:'100%', height:'100%', objectFit:'cover'}} />
             
             {/* Center Status Text */}
             {status !== 'Connected with Advisor' && (
                 <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', color:'white', textAlign:'center'}}>
                    <h3>{status}</h3>
                 </div>
             )}

             {/* Local PIP */}
             <div style={{position:'absolute', bottom:20, right:20, width:180, height:120, background:'#333', border:'2px solid #3b82f6', borderRadius:'8px', overflow:'hidden'}}>
                 {camError ? 
                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'red', textAlign:'center', fontSize:'0.7rem', padding:'5px', background:'#200'}}>
                        {camError}
                    </div> 
                  : <video ref={localVideoRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}} />
                 }
             </div>
         </main>

         <aside className="session-sidebar" style={{background:'#1e293b', padding:'10px', borderRadius:'10px', display:'flex', flexDirection:'column'}}>
             <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px'}}>
                {messages.map((m,i)=><div key={i} style={{alignSelf:m.sender==='me'?'flex-end':'flex-start', background:m.sender==='me'?'#3b82f6':'#334155', padding:'8px', borderRadius:'6px', maxWidth:'80%', fontSize:'0.9rem'}}>{m.text}</div>)}
             </div>
             <form onSubmit={handleSend} style={{marginTop:'10px', display:'flex'}}>
                <input value={inputMsg} onChange={e=>setInputMsg(e.target.value)} style={{flex:1, padding:'8px', borderRadius:'4px', border:'none'}} placeholder="Type..." />
                <button style={{marginLeft:'5px', padding:'8px', background:'#3b82f6', border:'none', borderRadius:'4px', color:'white'}}>Send</button>
             </form>
         </aside>
      </div>
    </div>
  );
};

export default UserVideo;