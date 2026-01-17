import { useState, useEffect, useRef } from 'react';
import { showToast } from '../components/ToastContainer';
import { confirmAction } from '../components/ConfirmationProvider';

const API_BASE_URL = 'http://localhost:9090/api/marketing';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };



  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: newMessage })
      });
      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const confirmed = await confirmAction(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      'Delete',
      'Cancel',
      'danger'
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}?deleteType=FOR_ME`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        showToast('Message deleted successfully', 'success');
        fetchMessages();
      } else {
        showToast('Failed to delete message', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to delete message', 'error');
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      {/* Chat Header */}
      <div style={{
        height: '72px',
        padding: '0 24px',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#fff'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          A
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>
            Admin
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Marketing Team Portal
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(msg => {
          // Marketing user sent this message if senderId is not admin (3)
          const isMarketingSent = msg.senderId !== 3;
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMarketingSent ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                alignSelf: isMarketingSent ? 'flex-end' : 'flex-start',
                position: 'relative'
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: isMarketingSent ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'white',
                  color: isMarketingSent ? 'white' : '#000',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  wordBreak: 'break-word',
                  position: 'relative'
                }}
              >
                <div>{msg.message}</div>
                <div style={{
                  fontSize: '11px',
                  marginTop: '4px',
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: isMarketingSent ? 'flex-end' : 'flex-start'
                }}>
                  {new Date(msg.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {isMarketingSent && msg.isRead !== undefined && (
                    msg.isRead ? (
                      <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1,5 4,8 8,2"/>
                        <polyline points="5,5 8,8 12,2"/>
                      </svg>
                    ) : (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1,5 4,8 11,1"/>
                      </svg>
                    )
                  )}
                </div>
                
                <button
                  onClick={() => setActiveMenu(activeMenu === msg.id ? null : msg.id)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: isMarketingSent ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    color: isMarketingSent ? 'white' : '#666',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                >
                  ⋮
                </button>
              </div>
              
              {activeMenu === msg.id && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '4px',
                    background: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    padding: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <button
                    onClick={() => {
                      handleDeleteMessage(msg.id);
                      setActiveMenu(null);
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#ff3b30',
                      textAlign: 'left',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fff0f0'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    Delete for me
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No messages yet. Start a conversation with admin!</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e5e5',
          background: '#fff',
          display: 'flex',
          gap: '12px'
        }}
      >
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #e5e5e5',
            borderRadius: '20px',
            fontSize: '14px',
            resize: 'none',
            height: '44px',
            fontFamily: 'inherit',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          style={{
            padding: '10px 20px',
            background: loading || !newMessage.trim() ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: loading || !newMessage.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send
        </button>
      </form>
    </div>
  );
};

export default Messages;
