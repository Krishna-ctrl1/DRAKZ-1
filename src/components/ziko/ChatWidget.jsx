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
  background: #764ba2;
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
  background: #1e1e2f;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  overflow: hidden;
  border: 1px solid #2b2b40;
`;

const Header = styled.div`
  background: #764ba2;
  padding: 15px;
  color: white;
  display: flex; justify-content: space-between; align-items: center;
  font-weight: bold;
`;

const MessageList = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 10px;
  background: #141423;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? '#764ba2' : '#2e2e48'};
  color: white;
  border-bottom-right-radius: ${props => props.isUser ? '2px' : '12px'};
  border-bottom-left-radius: ${props => props.isUser ? '12px' : '2px'};
`;

const InputArea = styled.div`
  padding: 15px;
  background: #1e1e2f;
  border-top: 1px solid #2b2b40;
  display: flex; gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  background: #2b2b40;
  border: none;
  padding: 10px;
  border-radius: 20px;
  color: white;
  outline: none;
  &::placeholder { color: #a0a0b0; }
`;

const SendButton = styled.button`
  background: #764ba2;
  color: white;
  border: none;
  width: 36px; height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; justify-content: center; align-items: center;
`;

const socket = io(BACKEND_URL);

const ChatWidget = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [active, setActive] = useState(false); // To prevent socket connect if not used?
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user && isOpen) {
            socket.emit('join_room', user._id);

            // Listen for messages
            socket.on('receive_message', (msg) => {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            });

            // Cleanup
            return () => {
                socket.off('receive_message');
            };
        }
    }, [user, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = () => {
        if (!inputValue.trim() || !user) return;

        const msgData = {
            userId: user._id,
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
