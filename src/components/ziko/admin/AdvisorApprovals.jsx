import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { BACKEND_URL } from "../../../config/backend";
import {
    UserTableContainer,
    StyledTable,
    ActionButton,
} from "../../../styles/ziko/admin/UserTable.styles";
import { Title } from "../../../styles/ziko/admin/SharedStyles";
import { MdCheck, MdClose, MdVisibility } from "react-icons/md";

// --- MODAL FOR DOCUMENT VIEWING ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85); 
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1e1e2f;
  color: #ffffff;
  padding: 24px;
  border-radius: 16px;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid #2e2e48;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: rgba(255,255,255,0.2); }
`;

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const DocumentCard = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.1);
  }

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 8px;
  }
  
  .doc-name {
    font-size: 0.9rem;
    text-align: center;
    word-break: break-all;
  }
`;

const AdvisorApprovals = () => {
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);

    const fetchPendingAdvisors = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch only pending advisors (role=advisor & isApproved=false)
            const response = await fetch(`${BACKEND_URL}/api/privilege/admin/users?role=advisor&isApproved=false`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter out rejected ones just in case (though API logic should handle this if refined, but good to be safe)
                setAdvisors(data.filter(u => !u.isRejected));
            }
        } catch (error) {
            console.error("Error fetching advisors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingAdvisors();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this advisor?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BACKEND_URL}/api/privilege/admin/advisors/${id}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setAdvisors(advisors.filter(a => a._id !== id));
            }
        } catch (error) {
            console.error("Error approving:", error);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject this advisor?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BACKEND_URL}/api/privilege/admin/advisors/${id}/reject`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setAdvisors(advisors.filter(a => a._id !== id));
            }
        } catch (error) {
            console.error("Error rejecting:", error);
        }
    };

    if (loading) return <p style={{ padding: "24px", color: "white" }}>Loading requests...</p>;

    return (
        <UserTableContainer>
            <Title style={{ padding: "24px 24px 0" }}>Pending Advisor Approvals</Title>

            {advisors.length === 0 ? (
                <p style={{ padding: "24px", color: "#a0a0b0" }}>No pending approvals.</p>
            ) : (
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Specialization</th>
                            <th>Experience</th>
                            <th>Documents</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {advisors.map((advisor) => (
                            <tr key={advisor._id}>
                                <td>{advisor.name}</td>
                                <td>{advisor.email}</td>
                                <td>{advisor.advisorProfile?.specialization || "N/A"}</td>
                                <td>{advisor.advisorProfile?.experience || 0} Years</td>
                                <td>
                                    {advisor.documents && advisor.documents.length > 0 ? (
                                        <ActionButton secondary onClick={() => setSelectedAdvisor(advisor)}>
                                            View ({advisor.documents.length})
                                        </ActionButton>
                                    ) : (
                                        <span style={{ color: "#ffffff40" }}>None</span>
                                    )}
                                </td>
                                <td>
                                    <ActionButton onClick={() => handleApprove(advisor._id)} title="Approve">
                                        <MdCheck size={18} /> Approve
                                    </ActionButton>
                                    <ActionButton secondary onClick={() => handleReject(advisor._id)} title="Reject" style={{ color: '#f87171' }}>
                                        <MdClose size={18} /> Reject
                                    </ActionButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            )}

            {/* DOCUMENT VIEWER MODAL */}
            {selectedAdvisor && (
                <ModalOverlay onClick={() => setSelectedAdvisor(null)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <CloseButton onClick={() => setSelectedAdvisor(null)}><MdClose /></CloseButton>
                        <h2>Documents for {selectedAdvisor.name}</h2>
                        <DocumentGrid>
                            {selectedAdvisor.documents.map((doc, idx) => (
                                <DocumentCard key={idx} href={`${BACKEND_URL}${doc.url}`} target="_blank" rel="noopener noreferrer">
                                    {doc.type === 'image' ? (
                                        <img src={`${BACKEND_URL}${doc.url}`} alt={doc.name} />
                                    ) : (
                                        <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333', borderRadius: '4px', width: '100%' }}>
                                            PDF
                                        </div>
                                    )}
                                    <span className="doc-name">{doc.name}</span>
                                </DocumentCard>
                            ))}
                        </DocumentGrid>
                    </ModalContent>
                </ModalOverlay>
            )}

        </UserTableContainer>
    );
};

export default AdvisorApprovals;
