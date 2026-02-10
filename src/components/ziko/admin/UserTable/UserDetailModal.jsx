import React from 'react';
import styled from 'styled-components';
import { MdClose, MdEmail, MdPhone, MdCreditScore, MdWork, MdAccountBalanceWallet, MdHistory } from 'react-icons/md';

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: #1e1e2f;
  width: 90%; max-width: 800px; max-height: 90vh;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.02);
`;

const Title = styled.h2`
  margin: 0; color: #fff; font-size: 1.5rem; display: flex; align-items: center; gap: 12px;
`;

const CloseButton = styled.button`
  background: none; border: none; color: #a0a0b0; cursor: pointer;
  font-size: 1.5rem; transition: color 0.2s;
  &:hover { color: #fff; }
`;

const ScrollContent = styled.div`
  padding: 24px; overflow-y: auto; flex: 1;
`;

const SectionTitle = styled.h3`
  color: #a0a0b0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;
  margin: 24px 0 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;
`;

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;
`;

const InfoCard = styled.div`
  background: rgba(255,255,255,0.03); padding: 16px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  
  label { display: block; color: #a0a0b0; font-size: 0.8rem; margin-bottom: 4px; }
  strong { color: #fff; font-size: 1.1rem; display: flex; align-items: center; gap: 8px; }
`;

const ProfileImg = styled.img`
  width: 60px; height: 60px; border-radius: 50%; object-fit: cover;
  border: 2px solid #3b82f6;
`;

const Badge = styled.span`
  padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;
  background: ${props => props.color || '#3b82f6'}; color: white;
`;

const UserDetailModal = ({ user, onClose }) => {
    if (!user) return null;

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={e => e.stopPropagation()}>
                <Header>
                    <Title>
                        <ProfileImg src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" />
                        <div>
                            {user.name}
                            <div style={{ fontSize: '0.9rem', color: '#a0a0b0', marginTop: '4px' }}>
                                <span style={{ marginRight: '10px' }}>{user.role}</span>
                                <Badge color={user.kycStatus === 'verified' ? '#059669' : user.kycStatus === 'pending' ? '#d97706' : '#52525b'}>
                                    KYC: {user.kycStatus || 'Unverified'}
                                </Badge>
                            </div>
                        </div>
                    </Title>
                    <CloseButton onClick={onClose}><MdClose /></CloseButton>
                </Header>

                <ScrollContent>
                    <Grid>
                        <InfoCard>
                            <label>Email Address</label>
                            <strong><MdEmail size={16} color="#60a5fa" /> {user.email}</strong>
                        </InfoCard>
                        <InfoCard>
                            <label>Phone</label>
                            <strong><MdPhone size={16} color="#34d399" /> {user.phone || 'N/A'}</strong>
                        </InfoCard>
                        <InfoCard>
                            <label>Registered On</label>
                            <strong><MdHistory size={16} color="#a78bfa" /> {new Date(user.created_at || user.createdAt).toLocaleDateString()}</strong>
                        </InfoCard>
                    </Grid>

                    <SectionTitle>Financial Overview</SectionTitle>
                    <Grid>
                        <InfoCard style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.1))' }}>
                            <label>Total Portfolio</label>
                            <strong style={{ color: '#60a5fa' }}><MdAccountBalanceWallet /> {formatCurrency(user.portfolioValue)}</strong>
                        </InfoCard>
                        <InfoCard>
                            <label>Monthly Income</label>
                            <strong>{formatCurrency(user.monthlyIncome)}</strong>
                        </InfoCard>
                        <InfoCard>
                            <label>Credit Score</label>
                            <strong style={{ color: user.creditScore > 750 ? '#34d399' : '#fbbf24' }}>
                                <MdCreditScore /> {user.creditScore || 'N/A'}
                            </strong>
                        </InfoCard>
                        <InfoCard>
                            <label>Total Debt</label>
                            <strong style={{ color: '#f87171' }}>{formatCurrency(user.totalDebt)}</strong>
                        </InfoCard>
                    </Grid>

                    {user.role === 'advisor' && (
                        <>
                            <SectionTitle>Advisor Profile</SectionTitle>
                            <Grid>
                                <InfoCard><label>Specialization</label><strong>{user.advisorProfile?.specialization || 'N/A'}</strong></InfoCard>
                                <InfoCard><label>Experience</label><strong>{user.advisorProfile?.experience || 0} Years</strong></InfoCard>
                                <InfoCard><label>Consultation Fee</label><strong>{formatCurrency(user.advisorProfile?.price)}</strong></InfoCard>
                                <InfoCard><label>Clients</label><strong>{user.activeGoals || 0} Active</strong></InfoCard>
                            </Grid>
                            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                <label style={{ color: '#a0a0b0', fontSize: '0.8rem' }}>Bio</label>
                                <p style={{ color: 'white', marginTop: '4px', lineHeight: '1.5' }}>{user.advisorProfile?.bio || 'No bio provided.'}</p>
                            </div>
                        </>
                    )}

                </ScrollContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default UserDetailModal;
