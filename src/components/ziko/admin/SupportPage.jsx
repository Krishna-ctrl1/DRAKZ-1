import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import { BACKEND_URL } from '../../../config/backend';
import { Title, Subtitle } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';
import { StyledTable, UserTableContainer, ActionButton } from '../../../styles/ziko/admin/UserTable.styles';
import { MdMessage, MdCheckCircle, MdError, MdPending, MdSend } from 'react-icons/md';

// --- STYLES ---
const Badge = styled.span`
  padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;
  background: ${props => props.bg || '#3b82f6'}; color: #fff;
  display: inline-flex; align-items: center; gap: 4px;
`;

const StatusBadge = ({ status }) => {
    let color = '#3b82f6'; // Open (Blue)
    let Icon = MdMessage;
    if (status === 'In Progress') { color = '#f59e0b'; Icon = MdPending; }
    if (status === 'Resolved') { color = '#10b981'; Icon = MdCheckCircle; }
    if (status === 'Closed') { color = '#6b7280'; Icon = MdCheckCircle; }

    return <Badge bg={color}><Icon size={12} /> {status}</Badge>;
};

const PriorityBadge = ({ priority }) => {
    let color = '#3b82f6'; // Low
    if (priority === 'Medium') color = '#f59e0b';
    if (priority === 'High') color = '#ef4444';

    return <span style={{ color, fontWeight: 'bold', fontSize: '0.85rem' }}>{priority}</span>;
};

// --- MODAL STYLES ---
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85); z-index: 1000;
  display: flex; justify-content: center; align-items: center;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: #1e1e2f; padding: 30px; border-radius: 12px;
  width: 90%; max-width: 600px;
  border: 1px solid #2b2b40; color: #fff;
  display: flex; flex-direction: column; gap: 15px;
`;

const TextArea = styled.textarea`
  width: 100%; height: 120px; padding: 12px;
  background: #141423; border: 1px solid #2e2e48; border-radius: 8px;
  color: #fff; font-family: inherit; resize: vertical; margin-top: 10px;
  &:focus { outline: none; border-color: #764ba2; }
`;

const Select = styled.select`
  padding: 10px; background: #141423; border: 1px solid #2e2e48; border-radius: 8px; color: #fff;
  margin-right: 10px;
`;

const SupportPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [newStatus, setNewStatus] = useState("");

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/api/privilege/admin/support`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setTickets(await res.json());
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, []);

    // --- JOIN CHAT ---
    const [activeChats, setActiveChats] = useState([]); // List of users with active chats
    const [currentChatUser, setCurrentChatUser] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [adminInput, setAdminInput] = useState("");
    const [view, setView] = useState("tickets"); // "tickets" or "chat"
    const [socket, setSocket] = useState(null);

    // Socket Init
    useEffect(() => {
        const newSocket = io(BACKEND_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join_room', 'admin_notifications');
        });

        // Listen for new messages from any user
        newSocket.on('admin_receive_message', (msg) => {
            // Update Active Chats List (Simple Unique Logic)
            setActiveChats(prev => {
                const existing = prev.find(c => c.userId === msg.userId);
                if (existing) return prev; // Already in list
                return [...prev, { userId: msg.userId, name: "User " + msg.userId.substr(-4), lastMsg: msg.text }];
            });

            // If chat window open for this user, append
            if (currentChatUser && currentChatUser.userId === msg.userId) {
                setChatMessages(prev => [...prev, msg]);
            }
        });

        return () => newSocket.close();
    }, [currentChatUser]);

    const handleAdminSend = () => {
        if (!adminInput.trim() || !currentChatUser || !socket) return;

        const msgData = {
            userId: currentChatUser.userId,
            text: adminInput,
            sender: 'admin',
            adminId: 'admin' // In real app, use actual admin ID
        };

        socket.emit('send_message', msgData);
        setChatMessages(prev => [...prev, { ...msgData, timestamp: new Date() }]);
        setAdminInput("");
    };

    const openChat = (user) => {
        setCurrentChatUser(user);
        // In real app, fetch chat history from DB here
        setChatMessages([]);
    };

    if (loading) return <div style={{ padding: "20px", color: "#fff" }}>Loading tickets...</div>;

    return (
        <>
            <Title>Support Center</Title>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <ActionButton onClick={() => setView('tickets')} style={{ background: view === 'tickets' ? '#764ba2' : '#2e2e48' }}>Tickets</ActionButton>
                <ActionButton onClick={() => setView('chat')} style={{ background: view === 'chat' ? '#764ba2' : '#2e2e48' }}>Live Chat</ActionButton>
            </div>

            {view === 'tickets' ? (
                <Section>
                    <FullWidthBox>
                        <UserTableContainer>
                            {tickets.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#a0a0b0" }}>No support tickets found.</div>
                            ) : (
                                <StyledTable>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>User</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Priority</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.map(ticket => (
                                            <tr key={ticket._id} style={{ opacity: ticket.status === 'Closed' || ticket.status === 'Resolved' ? 0.6 : 1 }}>
                                                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ fontWeight: 'bold' }}>{ticket.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#a0a0b0' }}>{ticket.email}</div>
                                                </td>
                                                <td style={{ color: '#fff', fontWeight: '500' }}>{ticket.subject}</td>
                                                <td><StatusBadge status={ticket.status} /></td>
                                                <td><PriorityBadge priority={ticket.priority} /></td>
                                                <td>
                                                    <ActionButton onClick={() => openTicket(ticket)}>
                                                        Manage
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
            ) : (
                // --- LIVE CHAT VIEW ---
                <Section style={{ display: 'flex', gap: '20px', height: '600px' }}>

                    {/* Active Chats List */}
                    <div style={{ flex: 1, background: '#1e1e2f', borderRadius: '12px', padding: '15px', border: '1px solid #2b2b40' }}>
                        <h3 style={{ color: 'white', borderBottom: '1px solid #2b2b40', paddingBottom: '10px' }}>Active Sessions</h3>
                        {activeChats.length === 0 && <p style={{ color: '#a0a0b0', marginTop: '20px' }}>No active chats.</p>}
                        {activeChats.map(chat => (
                            <div key={chat.userId}
                                onClick={() => openChat(chat)}
                                style={{
                                    padding: '10px',
                                    background: currentChatUser?.userId === chat.userId ? '#764ba2' : '#141423',
                                    borderRadius: '8px', marginBottom: '8px', cursor: 'pointer'
                                }}>
                                <div style={{ fontWeight: 'bold', color: '#fff' }}>{chat.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {chat.lastMsg}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Window */}
                    <div style={{ flex: 2, background: '#1e1e2f', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #2b2b40' }}>
                        {currentChatUser ? (
                            <>
                                <div style={{ padding: '15px', borderBottom: '1px solid #2b2b40', fontWeight: 'bold', color: 'white' }}>
                                    Chat with {currentChatUser.name}
                                </div>
                                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} style={{
                                            alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                                            background: msg.sender === 'admin' ? '#764ba2' : '#2b2b40',
                                            color: 'white', padding: '10px 15px', borderRadius: '12px', maxWidth: '70%'
                                        }}>
                                            {msg.text}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '15px', borderTop: '1px solid #2b2b40', display: 'flex', gap: '10px' }}>
                                    <input
                                        style={{ flex: 1, background: '#141423', border: 'none', padding: '10px', borderRadius: '6px', color: 'white' }}
                                        placeholder="Type a message..."
                                        value={adminInput}
                                        onChange={e => setAdminInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleAdminSend()}
                                    />
                                    <button onClick={handleAdminSend} style={{ background: '#764ba2', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}><MdSend /></button>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0b0' }}>
                                Select a user to start chatting
                            </div>
                        )}
                    </div>
                </Section>
            )}

            {/* --- MANAGE TICKET MODAL --- */}
            {selectedTicket && (
                <ModalOverlay onClick={() => setSelectedTicket(null)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: 0 }}>Manage Ticket</h2>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ color: '#a0a0b0', fontSize: '0.9rem', marginBottom: '5px' }}>
                                From: {selectedTicket.name} ({selectedTicket.email})
                            </div>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Subject: {selectedTicket.subject}</div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{selectedTicket.message}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#a0a0b0' }}>Update Status:</label>
                            <Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </Select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#a0a0b0' }}>Admin Reply (Internal/Email):</label>
                            <TextArea
                                placeholder="Type your reply here..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => setSelectedTicket(null)}
                                style={{ flex: 1, padding: '10px', background: '#2e2e48', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleUpdate}
                                style={{ flex: 1, padding: '10px', background: '#764ba2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Update Ticket
                            </button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default SupportPage;
