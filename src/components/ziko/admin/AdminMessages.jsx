import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Section } from "../../../styles/ziko/admin/AdminLayout.styles";
import { Title } from "../../../styles/ziko/admin/SharedStyles";
import { MdReply, MdCancel, MdSend, MdPerson, MdCalendarToday } from "react-icons/md";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/contact/all");
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (msg) => {
    if (!replyText) return toast.warning("Reply cannot be empty");
    setSendingReply(true);
    try {
      await axios.post("http://localhost:3001/api/contact/reply", {
        toEmail: msg.email,
        subject: msg.subject,
        replyMessage: replyText
      });
      toast.success("Reply sent successfully!");
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <>
      <Title>User Messages</Title>
      <ToastContainer theme="dark" />

      <Section>
        {loading ? (
          <div style={styles.loading}>Loading messages...</div>
        ) : (
          <div style={styles.grid}>
            {messages.map((msg) => (
              <div key={msg._id} style={styles.card}>
                
                {/* Header: Subject & Date */}
                <div style={styles.cardHeader}>
                  <h3 style={styles.subject}>{msg.subject}</h3>
                  <div style={styles.dateBadge}>
                    <MdCalendarToday size={14} />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Sender Info */}
                <div style={styles.senderInfo}>
                  <div style={styles.avatar}>
                    <MdPerson />
                  </div>
                  <div>
                    <span style={styles.senderName}>{msg.name}</span>
                    <span style={styles.senderEmail}>{msg.email}</span>
                  </div>
                </div>

                {/* Message Body */}
                <div style={styles.messageBox}>
                  {msg.message}
                </div>

                {/* Reply Section */}
                {replyingTo === msg._id ? (
                  <div style={styles.replyArea}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${msg.name}...`}
                      style={styles.textarea}
                    />
                    <div style={styles.actionButtons}>
                      <button 
                        onClick={() => sendReply(msg)}
                        disabled={sendingReply}
                        style={{...styles.button, ...styles.sendButton}}
                      >
                        {sendingReply ? "Sending..." : <><MdSend /> Send Reply</>}
                      </button>
                      <button 
                        onClick={() => setReplyingTo(null)}
                        style={{...styles.button, ...styles.cancelButton}}
                      >
                        <MdCancel /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setReplyingTo(msg._id); setReplyText(""); }}
                    style={{...styles.button, ...styles.replyButton}}
                  >
                    <MdReply /> Reply
                  </button>
                )}
              </div>
            ))}
            
            {messages.length === 0 && <p style={{color: '#888'}}>No messages found.</p>}
          </div>
        )}
      </Section>
    </>
  );
};

// --- STYLES OBJECT ---
const styles = {
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    // Glassmorphism / Dark Modern Look
    background: 'linear-gradient(145deg, #1f2235 0%, #161825 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '12px',
  },
  subject: {
    margin: 0,
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '6px 12px',
    borderRadius: '20px',
    color: '#a0a0b0',
    fontSize: '0.85rem',
  },
  senderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', // Matches sidebar gradient
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1.2rem',
  },
  senderName: {
    display: 'block',
    color: '#e0e0e0',
    fontWeight: '500',
    fontSize: '1rem',
  },
  senderEmail: {
    display: 'block',
    color: '#888',
    fontSize: '0.85rem',
  },
  messageBox: {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '16px',
    borderRadius: '12px',
    color: '#d1d1e0',
    lineHeight: '1.6',
    marginBottom: '20px',
    fontSize: '0.95rem',
  },
  replyArea: {
    marginTop: '20px',
    animation: 'fadeIn 0.3s ease-in-out',
  },
  textarea: {
    width: '100%',
    background: '#0f111a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px',
    color: '#fff',
    minHeight: '100px',
    marginBottom: '12px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  // The Gradient Button (Matches your active sidebar tab)
  replyButton: {
    background: 'linear-gradient(90deg, #7b2cbf 0%, #3a86ff 100%)',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(58, 134, 255, 0.3)',
  },
  sendButton: {
    background: '#4CAF50',
    color: '#fff',
  },
  cancelButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: '50px',
  }
};

export default AdminMessages;