import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { fetchMyAdvisorStatus } from '../../redux/slices/advisorSlice';
import Header from '../global/Header';
import Sidebar from '../global/Sidebar';
import '../../styles/gupta/UserVideo.css';

import { BACKEND_URL } from '../../config/backend';
const socket = io(BACKEND_URL);

const UserVideo = () => {
  const dispatch = useDispatch();
  const { myAdvisor } = useSelector((state) => state.advisor);

  const [collapsed, setCollapsed] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    dispatch(fetchMyAdvisorStatus());
  }, [dispatch]);

  useEffect(() => {
    // Listen for broadcast
    socket.on("receive_video", (data) => {
      setUpdates(prev => [data, ...prev]);
      if (!currentVideo) setCurrentVideo(data);

      // Browser notification
      if (Notification.permission === "granted") {
        new Notification("New Advisor Update", { body: data.title });
      }
    });

    return () => socket.off("receive_video");
  }, [currentVideo]);

  return (
    <div className="user-video-page">
      <Header />
      <div className="app user-video-app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          <div className="user-video-content">

            {/* Page Header */}
            <div className="page-header">
              <div className="header-info">
                <h1>Advisor Updates</h1>
                <p>Watch live broadcasts and updates from your advisor</p>
              </div>
              <div className="header-status">
                <span className={`live-indicator ${updates.length > 0 ? 'active' : ''}`}>
                  <i className="fa-solid fa-circle"></i>
                  {updates.length > 0 ? 'Live Feed Active' : 'Waiting for updates'}
                </span>
              </div>
            </div>

            {/* Advisor Info Card (if assigned) */}
            {myAdvisor && (
              <div className="advisor-info-banner">
                <div className="advisor-avatar">
                  {myAdvisor.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="advisor-details">
                  <span className="label">Your Advisor</span>
                  <h3>{myAdvisor.name}</h3>
                  {myAdvisor.advisorProfile?.specialization && (
                    <span className="spec">{myAdvisor.advisorProfile.specialization}</span>
                  )}
                </div>
                <a
                  href={`mailto:${myAdvisor.advisorProfile?.contactEmail || myAdvisor.email}`}
                  className="contact-btn"
                >
                  <i className="fa-solid fa-envelope"></i>
                  Contact Advisor
                </a>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="video-grid">

              {/* Video Player */}
              <div className="video-player-section">
                <div className="video-player">
                  {currentVideo ? (
                    <div className="video-wrapper">
                      <video
                        src={currentVideo.url}
                        controls
                        autoPlay
                        className="main-video"
                      />
                      <div className="video-info">
                        <h2>{currentVideo.title}</h2>
                        <span className="timestamp">
                          <i className="fa-solid fa-clock"></i>
                          Posted at {currentVideo.timestamp}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-video">
                      <div className="no-video-icon">
                        <i className="fa-solid fa-video"></i>
                      </div>
                      <h3>No Updates Available</h3>
                      <p>When your advisor broadcasts updates, they'll appear here</p>
                      {!myAdvisor && (
                        <Link to="/user/advisors" className="find-advisor-link">
                          <i className="fa-solid fa-user-tie"></i>
                          Find an Advisor First
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Updates List */}
              <div className="updates-sidebar">
                <div className="updates-header">
                  <h4>Recent Updates</h4>
                  <span className="count">{updates.length}</span>
                </div>

                <div className="updates-list">
                  {updates.length === 0 ? (
                    <div className="empty-updates">
                      <i className="fa-solid fa-inbox"></i>
                      <p>No updates yet</p>
                      <span>Stay tuned for advisor broadcasts</span>
                    </div>
                  ) : (
                    updates.map((item) => (
                      <div
                        key={item.id}
                        className={`update-card ${currentVideo?.id === item.id ? 'active' : ''}`}
                        onClick={() => setCurrentVideo(item)}
                      >
                        <div className="update-icon">
                          <i className="fa-solid fa-play"></i>
                        </div>
                        <div className="update-info">
                          <span className="update-title">{item.title}</span>
                          <span className="update-time">
                            <i className="fa-solid fa-clock"></i>
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                    ))
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

export default UserVideo;