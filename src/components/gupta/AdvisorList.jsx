import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    fetchAvailableAdvisors,
    fetchMyAdvisorStatus,
    requestAdvisor,
    cancelAdvisorRequest,
    clearMessages
} from '../../redux/slices/advisorSlice';
import Header from '../global/Header';
import Sidebar from '../global/Sidebar';
import '../../styles/gupta/AdvisorList.css';

const AdvisorList = () => {
    const dispatch = useDispatch();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedAdvisorId, setSelectedAdvisorId] = useState(null);
    const [requestMessage, setRequestMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    const {
        availableAdvisors,
        myAdvisor,
        myPendingRequests,
        advisorsLoading,
        statusLoading,
        error,
        successMessage
    } = useSelector((state) => state.advisor);

    useEffect(() => {
        dispatch(fetchAvailableAdvisors());
        dispatch(fetchMyAdvisorStatus());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                dispatch(clearMessages());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error, dispatch]);

    const handleSelectAdvisor = (advisorId) => {
        setSelectedAdvisorId(advisorId);
        setShowModal(true);
    };

    const handleSendRequest = () => {
        if (selectedAdvisorId) {
            dispatch(requestAdvisor({ advisorId: selectedAdvisorId, message: requestMessage }));
            setShowModal(false);
            setRequestMessage('');
            setSelectedAdvisorId(null);
        }
    };

    const handleCancelRequest = (requestId) => {
        dispatch(cancelAdvisorRequest(requestId));
    };

    const isPendingForAdvisor = (advisorId) => {
        return myPendingRequests.some(req => req.advisor?._id === advisorId || req.advisor === advisorId);
    };

    const getPendingRequestId = (advisorId) => {
        const request = myPendingRequests.find(req => req.advisor?._id === advisorId || req.advisor === advisorId);
        return request?._id;
    };

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <div className="advisor-list-page">
            <Header />
            <div className="app advisor-list-app">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <div className={collapsed ? "main-content-collapsed" : "main-content"}>
                    <div className="advisor-list-content">

                        {/* Success/Error Messages */}
                        {successMessage && (
                            <div className="toast-message success">{successMessage}</div>
                        )}
                        {error && (
                            <div className="toast-message error">{error}</div>
                        )}

                        {/* Current Assigned Advisor - Enhanced View */}
                        {myAdvisor && (
                            <div className="current-advisor-section">
                                <h2>Your Assigned Advisor</h2>
                                <div className="assigned-advisor-card">
                                    <div className="advisor-main-info">
                                        <div className="advisor-avatar-large">
                                            {myAdvisor.name?.[0]?.toUpperCase() || 'A'}
                                        </div>
                                        <div className="advisor-info-main">
                                            <h3>{myAdvisor.name}</h3>
                                            {myAdvisor.advisorProfile?.specialization && (
                                                <span className="specialization-tag">
                                                    <i className="fa-solid fa-briefcase"></i>
                                                    {myAdvisor.advisorProfile.specialization}
                                                </span>
                                            )}
                                            {myAdvisor.advisorProfile?.certificate && (
                                                <div className="cert-badge">
                                                    <i className="fa-solid fa-award"></i>
                                                    {myAdvisor.advisorProfile.certificate}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {myAdvisor.advisorProfile?.bio && (
                                        <p className="advisor-bio">{myAdvisor.advisorProfile.bio}</p>
                                    )}

                                    <div className="advisor-stats-row">
                                        {myAdvisor.advisorProfile?.experience > 0 && (
                                            <div className="stat-item">
                                                <i className="fa-solid fa-clock-rotate-left"></i>
                                                <span className="value">{myAdvisor.advisorProfile.experience}+ Years</span>
                                                <span className="label">Experience</span>
                                            </div>
                                        )}
                                        {myAdvisor.advisorProfile?.price > 0 && (
                                            <div className="stat-item">
                                                <i className="fa-solid fa-indian-rupee-sign"></i>
                                                <span className="value">{formatCurrency(myAdvisor.advisorProfile.price)}</span>
                                                <span className="label">Per Session</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="advisor-contact-section">
                                        <div className="contact-row">
                                            <i className="fa-solid fa-envelope"></i>
                                            <span>{myAdvisor.advisorProfile?.contactEmail || myAdvisor.email}</span>
                                        </div>
                                        {myAdvisor.advisorProfile?.contactPhone && (
                                            <div className="contact-row">
                                                <i className="fa-solid fa-phone"></i>
                                                <span>{myAdvisor.advisorProfile.contactPhone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="advisor-actions">
                                        <a
                                            href={`mailto:${myAdvisor.advisorProfile?.contactEmail || myAdvisor.email}?subject=Financial%20Advisory%20Request`}
                                            className="contact-advisor-btn email"
                                        >
                                            <i className="fa-solid fa-envelope"></i>
                                            Send Email
                                        </a>
                                        <Link to="/user/video" className="contact-advisor-btn video">
                                            <i className="fa-solid fa-video"></i>
                                            Advisor Updates
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pending Requests */}
                        {myPendingRequests.length > 0 && (
                            <div className="pending-requests-section">
                                <h3>Pending Requests</h3>
                                <div className="pending-requests-list">
                                    {myPendingRequests.map(request => (
                                        <div key={request._id} className="pending-request-card">
                                            <div className="pending-info">
                                                <span className="pending-icon">⏳</span>
                                                <span>Request sent to <strong>{request.advisor?.name || 'Advisor'}</strong></span>
                                            </div>
                                            <button
                                                className="cancel-request-btn"
                                                onClick={() => handleCancelRequest(request._id)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Advisors List */}
                        {!myAdvisor && (
                            <>
                                <div className="advisors-header">
                                    <h2>Find Your Financial Advisor</h2>
                                    <p>Choose from our certified financial advisors to guide your investment journey</p>
                                </div>

                                {advisorsLoading || statusLoading ? (
                                    <div className="loading-state">
                                        <div className="loading-spinner"></div>
                                        <p>Loading advisors...</p>
                                    </div>
                                ) : availableAdvisors.length === 0 ? (
                                    <div className="empty-state">
                                        <i className="fa-solid fa-user-tie"></i>
                                        <p>No advisors available at the moment</p>
                                    </div>
                                ) : (
                                    <div className="advisors-grid">
                                        {availableAdvisors.map(advisor => (
                                            <div key={advisor._id} className="advisor-card">
                                                <div className="advisor-card-header">
                                                    <div className="advisor-avatar">
                                                        {advisor.name?.[0]?.toUpperCase() || 'A'}
                                                    </div>
                                                    <div className="advisor-identity">
                                                        <h3>{advisor.name}</h3>
                                                        {advisor.advisorProfile?.specialization && (
                                                            <span className="spec-badge">{advisor.advisorProfile.specialization}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="advisor-details">
                                                    {advisor.advisorProfile?.bio && (
                                                        <p className="advisor-bio">{advisor.advisorProfile.bio}</p>
                                                    )}

                                                    <div className="advisor-stats">
                                                        {advisor.advisorProfile?.experience > 0 && (
                                                            <div className="stat-item">
                                                                <span className="stat-value">{advisor.advisorProfile.experience}+</span>
                                                                <span className="stat-label">Years Exp</span>
                                                            </div>
                                                        )}
                                                        {advisor.advisorProfile?.certificate && (
                                                            <div className="stat-item">
                                                                <span className="stat-value"><i className="fa-solid fa-certificate"></i></span>
                                                                <span className="stat-label">Certified</span>
                                                            </div>
                                                        )}
                                                        {advisor.advisorProfile?.price > 0 && (
                                                            <div className="stat-item">
                                                                <span className="stat-value">{formatCurrency(advisor.advisorProfile.price)}</span>
                                                                <span className="stat-label">/ session</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="advisor-contact">
                                                        <div className="contact-item">
                                                            <i className="fa-solid fa-envelope"></i>
                                                            <span>{advisor.advisorProfile?.contactEmail || advisor.email}</span>
                                                        </div>
                                                        {advisor.advisorProfile?.contactPhone && (
                                                            <div className="contact-item">
                                                                <i className="fa-solid fa-phone"></i>
                                                                <span>{advisor.advisorProfile.contactPhone}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {advisor.advisorProfile?.certificate && (
                                                        <div className="certificate-badge">
                                                            <i className="fa-solid fa-award"></i>
                                                            <span>{advisor.advisorProfile.certificate}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="advisor-card-footer">
                                                    {isPendingForAdvisor(advisor._id) ? (
                                                        <button
                                                            className="select-btn pending"
                                                            onClick={() => handleCancelRequest(getPendingRequestId(advisor._id))}
                                                        >
                                                            <i className="fa-solid fa-clock"></i> Pending - Cancel
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="select-btn"
                                                            onClick={() => handleSelectAdvisor(advisor._id)}
                                                        >
                                                            <i className="fa-solid fa-user-plus"></i> Select Advisor
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="request-modal" onClick={e => e.stopPropagation()}>
                        <h3>Send Request to Advisor</h3>
                        <p>Would you like to add a message to your request?</p>
                        <textarea
                            placeholder="Hi, I'm interested in your financial advisory services... (optional)"
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            rows={4}
                        />
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="confirm-btn" onClick={handleSendRequest}>
                                <i className="fa-solid fa-paper-plane"></i> Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvisorList;
