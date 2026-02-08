import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { fetchAdvisorStats } from '../../redux/slices/advisorSlice';
import Header from '../global/Header';
import Sidebar from '../global/Sidebar';
import '../../styles/gupta/VideoSession.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const socket = io(BACKEND_URL);

const VIDEO_LIBRARY = [
  { id: 1, title: "Market Outlook 2025", url: "https://www.youtube.com/embed/Cda-fUJ-GjE" },
  { id: 2, title: "Retirement Planning", url: "https://www.youtube.com/embed/PHe0bXAIuk0" },
  { id: 3, title: "Crypto Risks", url: "https://www.youtube.com/embed/N9T4M0wT7pI" },
];

const AdvisorVideo = () => {
  const dispatch = useDispatch();
  const { selectedClient, stats } = useSelector((state) => state.advisor);

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [viewMode, setViewMode] = useState('camera');
  const [currentVideo, setCurrentVideo] = useState(VIDEO_LIBRARY[0].url);

  const [isRecording, setIsRecording] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const localCamRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  useEffect(() => {
    dispatch(fetchAdvisorStats());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClient?._id) {
      const saved = localStorage.getItem(`note_${selectedClient._id}`);
      if (saved) setNote(saved);
    }
  }, [selectedClient]);

  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localCamRef.current) {
          localCamRef.current.srcObject = stream;
          localCamRef.current.muted = true;
        }
      } catch (e) {
        console.error("Camera denied:", e);
      }
    };
    startCam();
  }, []);

  useEffect(() => {
    if (localCamRef.current && streamRef.current) {
      localCamRef.current.srcObject = streamRef.current;
      localCamRef.current.muted = true;
    }
  }, [viewMode, isCinemaMode]);

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
        recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.current.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
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
    if (!recordedBlob) return;
    const videoUrl = URL.createObjectURL(recordedBlob);
    const updateData = {
      id: Date.now(), title: title || "Advisor Update", url: videoUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit("broadcast_video", updateData);
    alert("✅ Update broadcasted to all clients!");
    setRecordedBlob(null);
    setTitle('');
  };

  const saveNote = () => {
    if (selectedClient) {
      localStorage.setItem(`note_${selectedClient._id}`, note);
      alert("Note saved!");
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Cinema mode renders fullscreen without sidebar
  if (isCinemaMode) {
    return (
      <div className="cinema-mode-container">
        <div className="cinema-video-wrapper">
          <iframe
            src={`${currentVideo}?autoplay=0`}
            title="main"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          ></iframe>
          <div className="cinema-pip-camera">
            <video ref={localCamRef} autoPlay muted playsInline></video>
            <span className="pip-label">You</span>
          </div>
          <button onClick={toggleRecording} className="cinema-stop-btn">
            <i className="fa-solid fa-stop"></i> STOP RECORDING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-session-page">
      <Header />
      <div className="app video-app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          <div className="video-content">

            {/* Video Header */}
            <div className="video-header">
              <div className="header-left">
                <Link to="/advisor/dashboard" className="back-link">
                  <i className="fa-solid fa-arrow-left"></i>
                  Dashboard
                </Link>
                <h1>Broadcast Studio</h1>
              </div>
              <div className="header-right">
                <div className="header-stats">
                  <div className="stat-mini">
                    <span className="value">{stats.totalClients || 0}</span>
                    <span className="label">Clients</span>
                  </div>
                  <div className="stat-mini pending">
                    <span className="value">{stats.pendingRequests || 0}</span>
                    <span className="label">Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Video Grid */}
            <div className="video-main-grid">

              {/* Video Area */}
              <div className="video-main-section">
                <div className="video-controls-bar">
                  <div className="mode-info">
                    <span className="mode-label">{viewMode === 'youtube' ? 'Video Analysis' : 'Camera'}</span>
                    {isRecording && (
                      <span className="rec-indicator">
                        <span className="rec-dot"></span> REC
                      </span>
                    )}
                  </div>
                  <button
                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={toggleRecording}
                  >
                    <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-circle'}`}></i>
                    {isRecording ? "Stop" : "Record"}
                  </button>
                </div>

                <div className="video-container">
                  {viewMode === 'youtube' ? (
                    <>
                      <iframe
                        src={`${currentVideo}?autoplay=0`}
                        title="main"
                        allowFullScreen
                      ></iframe>
                      <div className="pip-camera">
                        <video ref={localCamRef} autoPlay muted playsInline></video>
                        <span className="pip-label">You</span>
                      </div>
                    </>
                  ) : (
                    <video ref={localCamRef} autoPlay muted playsInline className="camera-view"></video>
                  )}
                </div>

                {/* Broadcast Panel */}
                {recordedBlob && (
                  <div className="broadcast-panel">
                    <div className="broadcast-header">
                      <i className="fa-solid fa-video"></i>
                      <span>Ready to Broadcast</span>
                    </div>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Enter video title..."
                      className="broadcast-input"
                    />
                    <div className="broadcast-actions">
                      <button onClick={() => setRecordedBlob(null)} className="discard-btn">
                        <i className="fa-solid fa-trash"></i> Discard
                      </button>
                      <button onClick={handleBroadcast} className="broadcast-btn">
                        <i className="fa-solid fa-paper-plane"></i> Broadcast
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Panel */}
              <div className="video-sidebar">
                <div className="sidebar-tabs">
                  <button
                    className={activeTab === 'library' ? 'active' : ''}
                    onClick={() => setActiveTab('library')}
                    title="Video Library"
                  >
                    <i className="fa-solid fa-play"></i>
                  </button>
                  <button
                    className={activeTab === 'mode' ? 'active' : ''}
                    onClick={() => setActiveTab('mode')}
                    title="Recording Mode"
                  >
                    <i className="fa-solid fa-sliders"></i>
                  </button>
                  {selectedClient && (
                    <>
                      <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                        title="Client Info"
                      >
                        <i className="fa-solid fa-user"></i>
                      </button>
                      <button
                        className={activeTab === 'notes' ? 'active' : ''}
                        onClick={() => setActiveTab('notes')}
                        title="Session Notes"
                      >
                        <i className="fa-solid fa-note-sticky"></i>
                      </button>
                    </>
                  )}
                </div>

                <div className="tab-content">

                  {/* LIBRARY TAB */}
                  {activeTab === 'library' && (
                    <div className="library-tab">
                      <h4>Video Library</h4>
                      <p className="tab-subtitle">Select content to analyze</p>
                      <div className="video-list">
                        {VIDEO_LIBRARY.map(v => (
                          <div
                            key={v.id}
                            className={`video-item ${currentVideo === v.url ? 'active' : ''}`}
                            onClick={() => { setCurrentVideo(v.url); setViewMode('youtube'); }}
                          >
                            <div className="video-icon">
                              <i className="fa-solid fa-play"></i>
                            </div>
                            <span>{v.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MODE TAB */}
                  {activeTab === 'mode' && (
                    <div className="mode-tab">
                      <h4>Recording Mode</h4>
                      <p className="tab-subtitle">Choose your broadcast style</p>
                      <div className="mode-options">
                        <button
                          className={`mode-option ${viewMode === 'camera' ? 'active' : ''}`}
                          onClick={() => setViewMode('camera')}
                        >
                          <i className="fa-solid fa-camera"></i>
                          <div className="mode-text">
                            <strong>Camera Only</strong>
                            <span>Direct webcam recording</span>
                          </div>
                        </button>
                        <button
                          className={`mode-option ${viewMode === 'youtube' ? 'active' : ''}`}
                          onClick={() => setViewMode('youtube')}
                        >
                          <i className="fa-solid fa-display"></i>
                          <div className="mode-text">
                            <strong>Video Analysis</strong>
                            <span>Screen share + commentary</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PROFILE TAB */}
                  {activeTab === 'profile' && selectedClient && (
                    <div className="profile-tab">
                      <h4>{selectedClient.name}</h4>
                      <p className="tab-subtitle">Client Overview</p>
                      <div className="profile-stats">
                        <div className="profile-stat">
                          <span className="label">Monthly Income</span>
                          <span className="value income">{formatCurrency(selectedClient.monthlyIncome)}</span>
                        </div>
                        <div className="profile-stat">
                          <span className="label">Risk Profile</span>
                          <span className="value risk">{selectedClient.riskProfile || 'Moderate'}</span>
                        </div>
                        <div className="profile-stat">
                          <span className="label">Credit Score</span>
                          <span className="value score">{selectedClient.creditScore || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="profile-contact">
                        <p><i className="fa-solid fa-envelope"></i> {selectedClient.email}</p>
                        {selectedClient.phone && (
                          <p><i className="fa-solid fa-phone"></i> {selectedClient.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* NOTES TAB */}
                  {activeTab === 'notes' && selectedClient && (
                    <div className="notes-tab">
                      <h4>Session Notes</h4>
                      <p className="tab-subtitle">Private notes for {selectedClient.name}</p>
                      <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Write session notes..."
                        className="notes-textarea"
                      ></textarea>
                      <button onClick={saveNote} className="save-note-btn">
                        <i className="fa-solid fa-save"></i> Save Note
                      </button>
                    </div>
                  )}

                  {/* No Client */}
                  {(activeTab === 'profile' || activeTab === 'notes') && !selectedClient && (
                    <div className="no-client">
                      <i className="fa-solid fa-user-slash"></i>
                      <p>No client selected</p>
                      <span>Select from dashboard first</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorVideo;