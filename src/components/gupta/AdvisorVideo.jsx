import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../../styles/gupta/VideoSession.css';

const socket = io("http://localhost:3001");

const VIDEO_LIBRARY = [
  { id: 1, title: "Market Outlook 2025", url: "https://www.youtube.com/embed/Cda-fUJ-GjE" },
  { id: 2, title: "Retirement Planning", url: "https://www.youtube.com/embed/PHe0bXAIuk0" },
  { id: 3, title: "Crypto Risks", url: "https://www.youtube.com/embed/N9T4M0wT7pI" },
  { id: 4, title: "SIP Strategy", url: "https://www.youtube.com/embed/3vj6YQJ7q74" },
];

const AdvisorVideo = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [viewMode, setViewMode] = useState('camera'); 
  const [currentVideo, setCurrentVideo] = useState(VIDEO_LIBRARY[0].url);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [title, setTitle] = useState('');
  
  // REFS
  const localCamRef = useRef(null);
  const streamRef = useRef(null); // ✅ FIX: Store stream persistently
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  // 1. Initialize Camera
  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream; // Save stream to ref
        
        if (localCamRef.current) {
            localCamRef.current.srcObject = stream;
            localCamRef.current.muted = true;
        }
      } catch(e) {
        console.error("Camera denied:", e);
        alert("Please enable camera access.");
      }
    };
    startCam();
  }, []);

  // ✅ FIX: Re-attach camera stream when switching Views
  useEffect(() => {
    if (localCamRef.current && streamRef.current) {
        localCamRef.current.srcObject = streamRef.current;
        localCamRef.current.muted = true;
    }
  }, [viewMode, isCinemaMode]); // Run whenever view changes

  // --- AUDIO MIXER ---
  const mergeAudioStreams = (desktopStream, voiceStream) => {
    const context = new AudioContext();
    const destination = context.createMediaStreamDestination();
    
    if (desktopStream.getAudioTracks().length > 0) {
      const desktopSource = context.createMediaStreamSource(desktopStream);
      desktopSource.connect(destination);
    }
    
    if (voiceStream.getAudioTracks().length > 0) {
      const voiceSource = context.createMediaStreamSource(voiceStream);
      voiceSource.connect(destination);
    }
    
    return destination.stream.getAudioTracks();
  };

  // --- RECORDING LOGIC ---
  const toggleRecording = async () => {
    if (isRecording) {
      // STOP
      mediaRecorder.current?.stop();
      setIsRecording(false);
      setIsCinemaMode(false);
      
      if (mediaRecorder.current?.stream) {
          mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
      }
    } else {
      // START
      try {
        let finalStream;

        if (viewMode === 'youtube') {
           // Instruction is now visual, no alert blocking
           
           const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
               video: { displaySurface: "browser" }, 
               audio: true 
           });
           
           const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
           const mixedAudio = mergeAudioStreams(screenStream, micStream);
           
           finalStream = new MediaStream([
               ...screenStream.getVideoTracks(),
               ...mixedAudio
           ]);
           
           setIsCinemaMode(true);

        } else {
           finalStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        }

        const recorder = new MediaRecorder(finalStream);
        recordedChunks.current = [];

        recorder.ondataavailable = (e) => { 
            if(e.data.size > 0) recordedChunks.current.push(e.data); 
        };
        
        recorder.onstop = () => {
           const blob = new Blob(recordedChunks.current, {type: 'video/webm'});
           setRecordedBlob(blob);
           setIsCinemaMode(false);
        };
        
        recorder.start();
        mediaRecorder.current = recorder;
        setIsRecording(true);

      } catch (e) {
        console.error("Recording error:", e);
        setIsRecording(false);
        setIsCinemaMode(false);
      }
    }
  };

  const handleBroadcast = () => {
      if(!recordedBlob) return;
      if(!title) return alert("Enter a title");
      const videoUrl = URL.createObjectURL(recordedBlob);
      const updateData = {
          id: Date.now(), title: title, url: videoUrl,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      socket.emit("broadcast_video", updateData);
      alert("✅ Update Posted!");
      setRecordedBlob(null);
      setTitle('');
  };

  return (
    <div className={`video-session-page ${isCinemaMode ? 'cinema-mode' : ''}`} style={isCinemaMode ? {position:'fixed', top:0, left:0, width:'100vw', height:'100vh', zIndex:9999, background:'#000'} : {}}>
      
      {!isCinemaMode && (
        <header className="video-header">
            <nav><Link to="/advisor/dashboard">Dashboard</Link> <span>Session Recorder</span></nav>
            <div>ADVISOR MODE</div>
        </header>
      )}

      <div className="session-wrapper" style={{gridTemplateColumns: isCinemaMode ? '1fr' : '1fr 350px'}}>
        
        <main className="session-main">
          {!isCinemaMode && (
            <div className="session-header">
                <h3>{viewMode === 'youtube' ? 'Video Analysis Mode' : 'Direct Camera Mode'}</h3>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                {isRecording && <span style={{color:'red', fontWeight:'bold', marginRight:10, animation:'pulse 1s infinite'}}>● RECORDING</span>}
                <button className="btn-control" onClick={toggleRecording} style={{background: isRecording?'#444':'#ef4444'}}>
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
                </div>
            </div>
          )}

          {/* INSTRUCTION BANNER */}
          {!isRecording && viewMode === 'youtube' && !isCinemaMode && (
              <div style={{background:'#e0f2fe', color:'#0369a1', padding:'10px', borderRadius:'8px', marginBottom:'10px', fontSize:'0.9rem', border:'1px solid #7dd3fc'}}>
                  ℹ️ <b>Tip:</b> When recording starts, select <b>"This Tab"</b> in the popup to record the video and your face together nicely.
              </div>
          )}

          <div className="video-container" style={{position:'relative', background:'#000', borderRadius:'12px', overflow:'hidden', height: isCinemaMode ? '100vh' : 'auto'}}>
            
            {viewMode === 'youtube' ? (
                <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column'}}>
                    <iframe src={`${currentVideo}?autoplay=0`} title="main" allowFullScreen style={{flex:1, border:'none', pointerEvents: isRecording ? 'auto' : 'auto'}}></iframe>
                    
                    {/* ADVISOR PIP (Picture-in-Picture) */}
                    <div style={{
                        position:'absolute', bottom:20, right:20, width:200, height:150, 
                        background:'#222', border:'2px solid #2563eb', borderRadius:10, overflow:'hidden', zIndex:20,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        <video ref={localCamRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}}></video>
                    </div>

                    {isCinemaMode && (
                        <button 
                            onClick={toggleRecording}
                            style={{
                                position:'absolute', top:20, right:20, padding:'10px 20px', 
                                background:'red', color:'white', border:'none', borderRadius:'5px', 
                                cursor:'pointer', zIndex:50, fontWeight:'bold', boxShadow:'0 0 10px rgba(0,0,0,0.5)'
                            }}
                        >
                            STOP RECORDING
                        </button>
                    )}
                </div>
            ) : (
                <video ref={localCamRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}}></video>
            )}

          </div>

          {!isCinemaMode && recordedBlob && (
             <div style={{marginTop:20, background:'#1e293b', padding:20, borderRadius:12, display:'flex', gap:10}}>
                 <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Video Title" style={{flex:1, padding:10, borderRadius:6, border:'none'}} />
                 <button onClick={handleBroadcast} style={{padding:'10px 20px', background:'#10b981', color:'white', border:'none', borderRadius:6}}>Post to Users</button>
                 <button onClick={()=>setRecordedBlob(null)} style={{padding:'10px', background:'#333', color:'white', border:'none', borderRadius:6}}>Discard</button>
             </div>
          )}
        </main>

        {!isCinemaMode && (
            <aside className="session-sidebar">
            <div className="sidebar-tabs">
                <button className={`tab-link ${activeTab==='library'?'active':''}`} onClick={()=>setActiveTab('library')}>Video Library</button>
                <button className={`tab-link ${activeTab==='mode'?'active':''}`} onClick={()=>setActiveTab('mode')}>Modes</button>
            </div>

            {activeTab === 'library' && (
                <div className="tab-content">
                    <p style={{color:'#aaa', fontSize:'0.8rem', marginBottom:10}}>Select video to analyze:</p>
                    {VIDEO_LIBRARY.map(v => (
                        <div key={v.id} className="video-list-item" onClick={()=>{ setCurrentVideo(v.url); setViewMode('youtube'); }}>
                        <span style={{color: currentVideo===v.url && viewMode==='youtube' ? '#2563eb' : '#fff'}}>▶ {v.title}</span>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'mode' && (
                <div className="tab-content" style={{display:'flex', flexDirection:'column', gap:10}}>
                    <button onClick={()=>setViewMode('camera')} style={{padding:15, background: viewMode==='camera'?'#2563eb':'#334155', border:'none', color:'white', borderRadius:8, textAlign:'left'}}>
                        🎥 <b>Camera Only</b>
                    </button>
                    <button onClick={()=>setViewMode('youtube')} style={{padding:15, background: viewMode==='youtube'?'#2563eb':'#334155', border:'none', color:'white', borderRadius:8, textAlign:'left'}}>
                        📺 <b>Video Analysis</b>
                        <div style={{fontSize:'0.8rem', color:'#ccc'}}>Record YouTube + Face.</div>
                    </button>
                </div>
            )}
            </aside>
        )}
      </div>
    </div>
  );
};

export default AdvisorVideo;