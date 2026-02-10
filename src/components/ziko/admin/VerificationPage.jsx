import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BACKEND_URL } from '../../../config/backend';
import { Title, Subtitle } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';
import { StyledTable, ActionButton, UserTableContainer } from '../../../styles/ziko/admin/UserTable.styles';

// --- STYLES ---
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.85);
  display: flex; justifyContent: center; alignItems: center;
  z-index: 1000; backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background-color: #1e1e2f;
  border-radius: 12px;
  padding: 30px;
  width: 90%; max-width: 600px;
  display: flex; flexDirection: column; gap: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.6);
  border: 1px solid #2b2b40;
`;

const ImageContainer = styled.div`
  width: 100%; height: 300px;
  background-color: #000;
  display: flex; justify-content: center; align-items: center;
  border-radius: 8px; overflow: hidden;
  border: 1px solid #3f3f50;
`;

const StyledImage = styled.img`
  max-width: 100%; max-height: 100%; object-fit: contain;
`;

const Button = styled.button`
  padding: 10px 20px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer;
  background-color: ${props => props.reject ? '#ff5252' : '#00e676'};
  color: #fff; opacity: 0.9; transition: all 0.2s; flex: 1;

  &:hover { opacity: 1; transform: translateY(-2px); }
`;

const VerificationPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/api/kyc/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setRequests(await res.json());
            }
        } catch (error) {
            console.error("Error fetching KYC requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, status) => {
        const comment = status === 'rejected' ? prompt("Reason for rejection?") : "Verified by Admin";
        if (status === 'rejected' && !comment) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/api/kyc/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminComment: comment })
            });

            if (res.ok) {
                setSelectedRequest(null);
                fetchRequests();
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div style={{ padding: "20px", color: "#fff" }}>Loading requests...</div>;

    return (
        <>
            <Title>Identity Verification (KYC)</Title>

            <Section>
                <FullWidthBox>
                    <UserTableContainer>
                        {requests.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "#a0a0b0" }}>
                                <h3>No pending verification requests</h3>
                                <p>All caught up! Check back later.</p>
                            </div>
                        ) : (
                            <StyledTable>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Document Type</th>
                                        <th>Doc Number</th>
                                        <th>Submitted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req._id}>
                                            <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {req.user?.profilePicture ? (
                                                    <img src={`${BACKEND_URL}${req.user.profilePicture}`}
                                                        style={{ width: '30px', height: '30px', borderRadius: '50%' }} alt="" />
                                                ) : (
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#3b82f6' }}></div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{req.user?.name || "Unknown"}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#a0a0b0' }}>{req.user?.email}</div>
                                                </div>
                                            </td>
                                            <td style={{ textTransform: 'capitalize' }}>{req.documentType.replace('_', ' ')}</td>
                                            <td style={{ fontFamily: 'monospace' }}>{req.documentNumber}</td>
                                            <td>{new Date(req.submittedAt).toLocaleDateString()}</td>
                                            <td>
                                                <ActionButton onClick={() => setSelectedRequest(req)}
                                                    style={{ backgroundColor: '#6366f1', color: '#fff' }}>
                                                    Review
                                                </ActionButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </StyledTable>
                        )}
                    </UserTableContainer>
                </FullWidthBox>
            </Section>

            {/* --- REVIEW MODAL --- */}
            {selectedRequest && (
                <ModalOverlay onClick={() => setSelectedRequest(null)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, color: '#fff' }}>Review Document</h2>
                            <button onClick={() => setSelectedRequest(null)}
                                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                                &times;
                            </button>
                        </div>

                        <div style={{ color: '#dcdcdc' }}>
                            <p><strong>User:</strong> {selectedRequest.user?.name} ({selectedRequest.user?.email})</p>
                            <p><strong>Type:</strong> {selectedRequest.documentType.replace('_', ' ')}</p>
                            <p><strong>Number:</strong> {selectedRequest.documentNumber}</p>
                        </div>

                        <ImageContainer>
                            <StyledImage src={`${BACKEND_URL}${selectedRequest.documentUrl}`} alt="Document Evidence" />
                        </ImageContainer>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <Button reject onClick={() => handleAction(selectedRequest._id, 'rejected')}>Reject</Button>
                            <Button onClick={() => handleAction(selectedRequest._id, 'approved')}>Approve & Verify</Button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default VerificationPage;
