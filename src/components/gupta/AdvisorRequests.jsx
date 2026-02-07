import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAdvisorRequests,
    respondToRequest,
    clearMessages
} from '../../redux/slices/advisorSlice';
import '../../styles/gupta/AdvisorRequests.css';

const AdvisorRequests = () => {
    const dispatch = useDispatch();
    const {
        pendingRequests,
        requestsLoading,
        error,
        successMessage
    } = useSelector((state) => state.advisor);

    useEffect(() => {
        dispatch(fetchAdvisorRequests());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                dispatch(clearMessages());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error, dispatch]);

    const handleRespond = (requestId, action) => {
        dispatch(respondToRequest({ requestId, action }));
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (requestsLoading) {
        return (
            <div className="requests-container">
                <div className="loading-requests">
                    <div className="loading-spinner"></div>
                    <p>Loading requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="requests-container">
            {/* Notifications */}
            {successMessage && (
                <div className="notification success">{successMessage}</div>
            )}
            {error && (
                <div className="notification error">{error}</div>
            )}

            <div className="requests-header">
                <h3>
                    <i className="fa-solid fa-user-plus"></i>
                    Client Requests
                </h3>
                <span className="request-count">{pendingRequests.length} pending</span>
            </div>

            {pendingRequests.length === 0 ? (
                <div className="no-requests">
                    <i className="fa-solid fa-inbox"></i>
                    <p>No pending requests</p>
                    <span>New client requests will appear here</span>
                </div>
            ) : (
                <div className="requests-list">
                    {pendingRequests.map(request => (
                        <div key={request._id} className="request-card">
                            <div className="request-user-info">
                                <div className="user-avatar">
                                    {request.user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="user-details">
                                    <h4>{request.user?.name || 'Unknown User'}</h4>
                                    <p className="user-email">{request.user?.email}</p>
                                    <div className="user-meta">
                                        {request.user?.occupation && (
                                            <span className="meta-tag">
                                                <i className="fa-solid fa-briefcase"></i>
                                                {request.user.occupation}
                                            </span>
                                        )}
                                        {request.user?.creditScore && (
                                            <span className="meta-tag credit">
                                                <i className="fa-solid fa-chart-line"></i>
                                                Score: {request.user.creditScore}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {request.message && (
                                <div className="request-message">
                                    <i className="fa-solid fa-quote-left"></i>
                                    <p>{request.message}</p>
                                </div>
                            )}

                            <div className="request-footer">
                                <span className="request-date">
                                    <i className="fa-solid fa-clock"></i>
                                    {formatDate(request.requestedAt)}
                                </span>
                                <div className="request-actions">
                                    <button
                                        className="decline-btn"
                                        onClick={() => handleRespond(request._id, 'decline')}
                                    >
                                        <i className="fa-solid fa-times"></i>
                                        Decline
                                    </button>
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleRespond(request._id, 'approve')}
                                    >
                                        <i className="fa-solid fa-check"></i>
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdvisorRequests;
