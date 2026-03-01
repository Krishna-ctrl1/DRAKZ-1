import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import { MdChat, MdClose, MdSend, MdMinimize } from 'react-icons/md';
import { BACKEND_URL } from '../../config/backend';

const WidgetContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
`;

const ChatButton = styled.button`
  width: 60px; height: 60px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  cursor: pointer;
  display: flex; justify-content: center; align-items: center;
  font-size: 28px;
  transition: transform 0.2s;
  &:hover { transform: scale(1.1); }
`;

const ChatWindow = styled.div`
  width: 350px;
  height: 500px;
  background-color: #020617; 
  background-image: 
    radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.15) 0px, transparent 50%), 
    radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  display: flex; flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Header = styled.div`
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  padding: 15px;
  color: white;
  display: flex; justify-content: space-between; align-items: center;
  font-weight: bold;
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const MessageList = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 10px;
  background: transparent;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(30, 41, 59, 0.8)'};
  color: white;
  border-bottom-right-radius: ${props => props.isUser ? '2px' : '12px'};
  border-bottom-left-radius: ${props => props.isUser ? '12px' : '2px'};
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid ${props => props.isUser ? 'transparent' : 'rgba(255,255,255,0.05)'};
`;

const InputArea = styled.div`
  padding: 15px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex; gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 10px 15px;
  border-radius: 20px;
  color: white;
  outline: none;
  transition: all 0.2s;
  &:focus {
      background: rgba(255,255,255,0.1);
      border-color: rgba(56, 189, 248, 0.5);
  }
  &::placeholder { color: #94a3b8; }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  width: 38px; height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; justify-content: center; align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  }
`;

const socket = io(BACKEND_URL);

const ChatWidget = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [active, setActive] = useState(false); // To prevent socket connect if not used?
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const [unread, setUnread] = useState(0);

    // 1. Establish socket connection and listen for messages continuously
    useEffect(() => {
        if (!user) return;

        const userId = user._id || user.id;
        socket.emit('join_room', userId);

        const handleReceiveMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (!isOpen && msg.sender !== 'user') {
                setUnread(prev => prev + 1);
            } else {
                scrollToBottom();
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [user, isOpen]);

    // 2. Fetch history only when opened for the first time
    useEffect(() => {
        if (user && isOpen && messages.length === 0) {
            const fetchHistory = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${BACKEND_URL}/api/user/chat-history`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const history = await res.json();
                        setMessages(history);
                        setTimeout(scrollToBottom, 100);
                    }
                } catch (error) { console.error('Error fetching history:', error); }
            };
            fetchHistory();
        }
    }, [user, isOpen]);

    // Clear unread when opened
    useEffect(() => {
        if (isOpen) {
            setUnread(0);
            setTimeout(scrollToBottom, 50);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = () => {
        if (!inputValue.trim() || !user) return;

        const userId = user._id || user.id;
        const msgData = {
            userId: userId,
            name: user.name,
            text: inputValue,
            sender: 'user'
        };

        socket.emit('send_message', msgData);
        // Optimistic UI update (optional, but socket usually echoes back)
        // For now rely on socket echo for consistency or add locally:
        // setMessages(prev => [...prev, { text: inputValue, sender: 'user' }]);

        setInputValue('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    if (!user || user.role === 'admin') return null; // Admins don't need the user widget

    return (
        <WidgetContainer>
            {!isOpen && (
                <ChatButton onClick={() => setIsOpen(true)}>
                    <MdChat />
                    {unread > 0 && (
                        <span style={{
                            position: 'absolute', top: '-5px', right: '-5px',
                            background: '#ef4444', color: 'white',
                            fontSize: '0.75rem', fontWeight: 'bold',
                            padding: '2px 6px', borderRadius: '10px',
                            border: '2px solid #020617'
                        }}>
                            {unread}
                        </span>
                    )}
                </ChatButton>
            )}

            {isOpen && (
                <ChatWindow>
                    <Header>
                        <span>Support Chat</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <MdMinimize style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                        </div>
                    </Header>
                    <MessageList>
                        <div style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', marginTop: '10px' }}>
                            Start chatting with support.
                        </div>
                        {messages.map((msg, idx) => (
                            <MessageBubble key={idx} isUser={msg.sender === 'user'}>
                                {msg.text}
                            </MessageBubble>
                        ))}
                        <div ref={messagesEndRef} />
                    </MessageList>
                    <InputArea>
                        <Input
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <SendButton onClick={handleSend}><MdSend /></SendButton>
                    </InputArea>
                </ChatWindow>
            )}
        </WidgetContainer>
    );
};

export default ChatWidget;
