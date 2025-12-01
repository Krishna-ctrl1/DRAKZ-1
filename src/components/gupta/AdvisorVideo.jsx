import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../../styles/gupta/VideoSession.css';

const socket = io("http://localhost:3001");

const AdvisorVideo = () => {
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [title, setTitle] = useState('');
  
  const localCamRef = useRef(null);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  // 1. Start Camera Preview
  useEffect(() => {
    const startCam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localCamRef.current) {
                localCamRef.current.srcObject = stream;
                localCamRef.current.muted = true; // Mute self
            }
        } catch(e) {
            console.error("Camera denied:", e);
            alert("Camera access required to record updates.");
        }
    };
    startCam();
  }, []);

  // 2. Toggle Recording
  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      if (!localCamRef.current?.srcObject) return;
      
      const stream = localCamRef.current.srcObject;
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => { if(e.data.size > 0) recordedChunks.current.push(e.data); };
      recorder.onstop = () => {
         const blob = new Blob(recordedChunks.current, {type: 'video/webm'});
         setRecordedBlob(blob);
         recordedChunks.current = [];
      };
      
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    }
  };

  // 3. Broadcast to All Users
  const handleBroadcast = () => {
      if(!recordedBlob) return;
      if(!title.trim()) return alert("Please enter a title for this update");

      // In a real app, upload 'recordedBlob' to AWS S3/Cloudinary here.
      // For this demo, we create a local URL.
      const videoUrl = URL.createObjectURL(recordedBlob);
      
      const updateData = {
          id: Date.now(),
          title: title,
          url: videoUrl,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };

      // Send to Server
      socket.emit("broadcast_video", updateData);
      
      alert("✅ Update posted to ALL User Dashboards!");
      setRecordedBlob(null);
      setTitle('');
  };

  return (
    <div className="video-session-page">
      <header className="video-header">
        <nav><Link to="/advisor/dashboard">Dashboard</Link> <span>Broadcast Center</span></nav>
        <div>ADVISOR MODE</div>
      </header>

      <div className="session-wrapper" style={{gridTemplateColumns:'1fr'}}>
        <main className="session-main" style={{maxWidth:'800px', margin:'0 auto', width:'100%'}}>
          
          <div className="session-header">
            <h3>Create Market Update</h3>
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
               {isRecording && <span style={{color:'red', fontWeight:'bold', marginRight:10, animation:'pulse 1s infinite'}}>● RECORDING</span>}
               <button className="btn-control" onClick={toggleRecording} style={{background: isRecording?'#444':'#ef4444'}}>
                 {isRecording ? "Stop Recording" : "Start Recording"}
               </button>
            </div>
          </div>

          <div className="video-container" style={{flexDirection:'column', gap:'20px'}}>
            
            {/* Camera / Preview Area */}
            <div className="shared-player" style={{height:'400px', background:'#000', borderRadius:'12px', overflow:'hidden'}}>
               {recordedBlob ? (
                   <video controls src={URL.createObjectURL(recordedBlob)} style={{width:'100%', height:'100%', objectFit:'contain'}}></video>
               ) : (
                   <video ref={localCamRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}}></video>
               )}
            </div>

            {/* Post Controls (Only visible after recording) */}
            {recordedBlob && (
                <div style={{background:'#1e293b', padding:'20px', borderRadius:'12px', display:'flex', gap:'15px', alignItems:'center'}}>
                    <input 
                        value={title}
                        onChange={e=>setTitle(e.target.value)}
                        placeholder="e.g., Weekly Market Analysis - Nov 24"
                        style={{flex:1, padding:'12px', borderRadius:'6px', border:'1px solid #475569', background:'#0f172a', color:'white'}}
                    />
                    <button onClick={handleBroadcast} style={{padding:'12px 24px', background:'#2563eb', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>
                        Post to All Users
                    </button>
                    <button onClick={()=>setRecordedBlob(null)} style={{padding:'12px', background:'transparent', color:'#aaa', border:'1px solid #444', borderRadius:'6px', cursor:'pointer'}}>
                        Discard
                    </button>
                </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdvisorVideo;