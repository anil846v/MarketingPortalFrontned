import { useState, useEffect, useRef } from 'react';
import { showToast } from '../components/ToastContainer';
import { confirmAction } from '../components/ConfirmationProvider';
import { API_BASE_URL } from '../config';
import { useApiError } from '../hooks/useApiError';

const MessagesSection = ({ setSidebarOpen }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Changed from 5s to 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchConversation();
      const interval = setInterval(fetchConversation, 10000); // Changed from 3s to 10s
      return () => clearInterval(interval);
    }
  }, [selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/marketing-users`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        // Filter to only show active/approved users
        const activeUsers = (data.users || []).filter(user => user.status === 'Approved');
        setUsers(activeUsers);
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const fetchConversation = async () => {
    if (!selectedUserId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/messages/conversation/${selectedUserId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setMessages(data || []);
    } catch (error) {
      // Silently handle error
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/messages/unread-count`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setUnreadCount(data.count || 0);
    } catch (error) {
      // Silently handle error
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ receiverId: selectedUserId, message: newMessage })
      });
      if (response.ok) {
        setNewMessage('');
        fetchConversation();
      }
    } catch (error) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId, deleteType) => {
    const confirmMsg = deleteType === 'FOR_EVERYONE'
      ? 'Delete this message for everyone? This cannot be undone.'
      : 'Delete this message for you only?';

    const confirmed = await confirmAction(
      'Delete Message',
      confirmMsg,
      'Delete',
      'Cancel',
      'danger'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/messages/${messageId}?deleteType=${deleteType}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        showToast('Message deleted successfully', 'success');
        fetchConversation();
      } else {
        showToast('Failed to delete message', 'error');
      }
    } catch (error) {
      showToast('Failed to delete message', 'error');
    }
  };

  const selectedUser = users.find(u => u.userId === selectedUserId);

  return (
    <div className={`messages-container ${selectedUserId ? 'chat-active' : ''}`}>
      {/* Users Sidebar */}
      <div className="users-sidebar">
        <div className="sidebar-header-msg">
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#000' }}>Messages</h3>
          {unreadCount > 0 && (
            <span className="unread-badge">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="users-list">
          {users.map(user => (
            <div
              key={user.userId}
              onClick={() => {
                setSelectedUserId(user.userId);
                setSidebarOpen(false);
              }}
              style={{
                padding: '14px 20px',
                cursor: 'pointer',
                background: selectedUserId === user.userId ? '#e8f5e9' : 'white',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                if (selectedUserId !== user.userId) {
                  e.currentTarget.style.background = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedUserId !== user.userId) {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {user.fullName?.charAt(0) || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '2px' }}>
                  {user.fullName}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedUserId ? (
          <>
            {/* Chat Header - Fixed */}
            <div className="chat-header">
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
                {selectedUser?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>
                  {selectedUser?.fullName}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {selectedUser?.assignedRegion || 'Marketing Team'}
                </div>
              </div>
            </div>

            {/* Messages List - Scrollable */}
            <div className="messages-list">
              {messages.map(msg => {
                const isSent = msg.senderId !== selectedUserId;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isSent ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      alignSelf: isSent ? 'flex-end' : 'flex-start',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: isSent ? '#667eea' : 'white',
                        color: isSent ? 'white' : '#000',
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
                        gap: '4px'
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {isSent && msg.isRead && (
                          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1,5 4,8 8,2" />
                            <polyline points="5,5 8,8 12,2" />
                          </svg>
                        )}
                        {isSent && !msg.isRead && (
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1,5 4,8 11,1" />
                          </svg>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveMenu(activeMenu === msg.id ? null : msg.id)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: isSent ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          color: isSent ? 'white' : '#666',
                          fontSize: '12px'
                        }}
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
                            handleDeleteMessage(msg.id, 'FOR_ME');
                            setActiveMenu(null);
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#666',
                            textAlign: 'left',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          Delete for me
                        </button>
                        {isSent && (
                          <button
                            onClick={() => {
                              handleDeleteMessage(msg.id, 'FOR_EVERYONE');
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
                            Delete for everyone
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Fixed */}
            <form
              onSubmit={handleSend}
              className="message-input-form"
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
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '15px',
            background: '#f8f9fa'
          }}>
            <div style={{ textAlign: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <div>Select a user to start messaging</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesSection;
