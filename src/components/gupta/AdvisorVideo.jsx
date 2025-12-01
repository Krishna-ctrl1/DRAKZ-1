import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Access Redux
import { io } from 'socket.io-client';
import '../../styles/gupta/VideoSession.css';

const socket = io("http://localhost:3001");

const VIDEO_LIBRARY = [
  { id: 1, title: "Market Outlook 2025", url: "https://www.youtube.com/embed/Cda-fUJ-GjE" },
  { id: 2, title: "Retirement Planning", url: "https://www.youtube.com/embed/PHe0bXAIuk0" },
  { id: 3, title: "Crypto Risks", url: "https://www.youtube.com/embed/N9T4M0wT7pI" },
];

const AdvisorVideo = () => {
  // Access selected client from Redux
  const { selectedClient } = useSelector((state) => state.advisor);

  // Tabs: 'library', 'mode', 'profile', 'notes'
  const [activeTab, setActiveTab] = useState('library');
  const [viewMode, setViewMode] = useState('camera'); 
  const [currentVideo, setCurrentVideo] = useState(VIDEO_LIBRARY[0].url);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState(''); // Note state
  
  const localCamRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  // Load saved note for this client
  useEffect(() => {
    if (selectedClient?._id) {
        const saved = localStorage.getItem(`note_${selectedClient._id}`);
        if(saved) setNote(saved);
    }
  }, [selectedClient]);

  // 1. Initialize Camera
  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localCamRef.current) {
            localCamRef.current.srcObject = stream;
            localCamRef.current.muted = true;
        }
      } catch(e) {
        console.error("Camera denied:", e);
      }
    };
    startCam();
  }, []);

  // Re-attach stream on render
  useEffect(() => {
    if (localCamRef.current && streamRef.current) {
        localCamRef.current.srcObject = streamRef.current;
        localCamRef.current.muted = true;
    }
  }, [viewMode, isCinemaMode]);

  // --- AUDIO MIXER ---
  const mergeAudioStreams = (desktopStream, voiceStream) => {
    const context = new AudioContext();
    const destination = context.createMediaStreamDestination();
    if (desktopStream.getAudioTracks().length > 0) {
      context.createMediaStreamSource(desktopStream).connect(destination);
    }
    if (voiceStream.getAudioTracks().length > 0) {
      context.createMediaStreamSource(voiceStream).connect(destination);
    }
    return destination.stream.getAudioTracks();
  };

  // --- RECORDING ---
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
      setIsCinemaMode(false);
      if (mediaRecorder.current?.stream) mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    } else {
      try {
        let finalStream;
        if (viewMode === 'youtube') {
           const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "browser" }, audio: true });
           const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
           const mixedAudio = mergeAudioStreams(screenStream, micStream);
           finalStream = new MediaStream([...screenStream.getVideoTracks(), ...mixedAudio]);
           setIsCinemaMode(true);
        } else {
           finalStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        }

        const recorder = new MediaRecorder(finalStream);
        recordedChunks.current = [];
        recorder.ondataavailable = (e) => { if(e.data.size > 0) recordedChunks.current.push(e.data); };
        recorder.onstop = () => {
           const blob = new Blob(recordedChunks.current, {type: 'video/webm'});
           setRecordedBlob(blob);
           setIsCinemaMode(false);
        };
        recorder.start();
        mediaRecorder.current = recorder;
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
        setIsCinemaMode(false);
      }
    }
  };

  const handleBroadcast = () => {
      if(!recordedBlob) return;
      const videoUrl = URL.createObjectURL(recordedBlob);
      const updateData = {
          id: Date.now(), title: title || "Advisor Update", url: videoUrl,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      socket.emit("broadcast_video", updateData);
      alert("✅ Posted!");
      setRecordedBlob(null);
      setTitle('');
  };

  const saveNote = () => {
      if(selectedClient) {
          localStorage.setItem(`note_${selectedClient._id}`, note);
          alert("Note Saved locally");
      }
  };

  if (!selectedClient) return <div style={{padding:50, color:'white'}}>Please select a client from Dashboard.</div>;

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
                <h3>{viewMode === 'youtube' ? 'Video Analysis' : 'Direct Camera'}</h3>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                {isRecording && <span style={{color:'red', fontWeight:'bold', marginRight:10, animation:'pulse 1s infinite'}}>● REC</span>}
                <button className="btn-control" onClick={toggleRecording} style={{background: isRecording?'#444':'#ef4444'}}>
                    {isRecording ? "Stop" : "Record"}
                </button>
                </div>
            </div>
          )}

          <div className="video-container" style={{position:'relative', background:'#000', borderRadius:'12px', overflow:'hidden', height: isCinemaMode ? '100vh' : 'auto'}}>
            {viewMode === 'youtube' ? (
                <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column'}}>
                    <iframe src={`${currentVideo}?autoplay=0`} title="main" allowFullScreen style={{flex:1, border:'none', pointerEvents: isRecording ? 'auto' : 'auto'}}></iframe>
                    <div style={{position:'absolute', bottom:20, right:20, width:200, height:150, background:'#222', border:'2px solid #2563eb', borderRadius:10, overflow:'hidden', zIndex:20}}>
                        <video ref={localCamRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}}></video>
                    </div>
                    {isCinemaMode && <button onClick={toggleRecording} style={{position:'absolute', top:20, right:20, padding:'10px 20px', background:'red', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', zIndex:50, fontWeight:'bold'}}>STOP RECORDING</button>}
                </div>
            ) : (
                <video ref={localCamRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}}></video>
            )}
          </div>

          {!isCinemaMode && recordedBlob && (
             <div style={{marginTop:20, background:'#1e293b', padding:20, borderRadius:12, display:'flex', gap:10}}>
                 <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Video Title" style={{flex:1, padding:10, borderRadius:6, border:'none'}} />
                 <button onClick={handleBroadcast} style={{padding:'10px 20px', background:'#10b981', color:'white', border:'none', borderRadius:6}}>Post</button>
                 <button onClick={()=>setRecordedBlob(null)} style={{padding:'10px', background:'#333', color:'white', border:'none', borderRadius:6}}>Discard</button>
             </div>
          )}
        </main>

        {/* SIDEBAR */}
        {!isCinemaMode && (
            <aside className="session-sidebar">
            {/* TABS HEADER */}
            <div className="sidebar-tabs">
                <button className={`tab-link ${activeTab==='library'?'active':''}`} onClick={()=>setActiveTab('library')} title="Videos"><i className="fa-solid fa-play"></i></button>
                <button className={`tab-link ${activeTab==='mode'?'active':''}`} onClick={()=>setActiveTab('mode')} title="Modes"><i className="fa-solid fa-sliders"></i></button>
                {/* NEW TABS */}
                <button className={`tab-link ${activeTab==='profile'?'active':''}`} onClick={()=>setActiveTab('profile')} title="Client Info"><i className="fa-solid fa-user"></i></button>
                <button className={`tab-link ${activeTab==='notes'?'active':''}`} onClick={()=>setActiveTab('notes')} title="Notes"><i className="fa-solid fa-note-sticky"></i></button>
            </div>

            {/* TAB CONTENT */}
            <div className="tab-content" style={{padding:'15px', overflowY:'auto', height:'100%'}}>
                
                {/* 1. LIBRARY */}
                {activeTab === 'library' && (
                    <>
                        <p style={{color:'#aaa', fontSize:'0.8rem', marginBottom:10}}>Select video to analyze:</p>
                        {VIDEO_LIBRARY.map(v => (
                            <div key={v.id} className="video-list-item" onClick={()=>{ setCurrentVideo(v.url); setViewMode('youtube'); }} style={{padding:'10px', marginBottom:'5px', background:'#334155', borderRadius:'5px', cursor:'pointer'}}>
                                <span style={{color: currentVideo===v.url ? '#2563eb' : '#fff'}}>▶ {v.title}</span>
                            </div>
                        ))}
                    </>
                )}

                {/* 2. MODES */}
                {activeTab === 'mode' && (
                    <div style={{display:'flex', flexDirection:'column', gap:10}}>
                        <button onClick={()=>setViewMode('camera')} style={{padding:15, background: viewMode==='camera'?'#2563eb':'#334155', border:'none', color:'white', borderRadius:8, textAlign:'left'}}>
                            🎥 <b>Camera Only</b>
                        </button>
                        <button onClick={()=>setViewMode('youtube')} style={{padding:15, background: viewMode==='youtube'?'#2563eb':'#334155', border:'none', color:'white', borderRadius:8, textAlign:'left'}}>
                            📺 <b>Video Analysis</b>
                        </button>
                    </div>
                )}

                {/* 3. NEW: PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div style={{color:'white'}}>
                        <h4 style={{borderBottom:'1px solid #444', paddingBottom:10}}>{selectedClient.name}</h4>
                        <div style={{marginTop:15, display:'flex', flexDirection:'column', gap:15}}>
                            <div style={{background:'#333', padding:10, borderRadius:6}}>
                                <div style={{color:'#aaa', fontSize:'0.8rem'}}>Email</div>
                                <div>{selectedClient.email}</div>
                            </div>
                            <div style={{background:'#333', padding:10, borderRadius:6}}>
                                <div style={{color:'#aaa', fontSize:'0.8rem'}}>Risk Profile</div>
                                <div style={{color:'#f59e0b', fontWeight:'bold'}}>Moderate</div>
                            </div>
                            <div style={{background:'#333', padding:10, borderRadius:6}}>
                                <div style={{color:'#aaa', fontSize:'0.8rem'}}>Total Invested</div>
                                <div style={{color:'#10b981', fontWeight:'bold'}}>$124,500</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. NEW: NOTES TAB */}
                {activeTab === 'notes' && (
                    <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
                        <textarea 
                            value={note} 
                            onChange={e=>setNote(e.target.value)} 
                            placeholder="Write private notes about this session..." 
                            style={{flex:1, background:'#333', border:'1px solid #444', color:'white', padding:10, borderRadius:6, resize:'none'}}
                        ></textarea>
                        <button onClick={saveNote} style={{marginTop:10, padding:10, background:'#10b981', border:'none', borderRadius:6, color:'white', fontWeight:'bold', cursor:'pointer'}}>
                            Save Note
                        </button>
                    </div>
                )}
            </div>
            </aside>
        )}
      </div>
    </div>
  );
};

export default AdvisorVideo;