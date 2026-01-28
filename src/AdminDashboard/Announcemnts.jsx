import { useState, useEffect } from 'react';
import { showToast } from '../components/ToastContainer';
import { confirmAction } from '../components/ConfirmationProvider';
import { API_BASE_URL } from '../config';

const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchAnnouncements();
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [page]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/admin/announcements?page=${page}&size=20`, {
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to load announcements');
      const data = await response.json();
      setAnnouncements(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      if (error.name === 'AbortError') {
        setError('Request timeout. Please try again.');
      } else {
        setError('Failed to load announcements. Click retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction(
      'Delete Announcement',
      'Are you sure you want to delete this announcement? This action cannot be undone.',
      'Delete',
      'Cancel',
      'danger'
    );

    if (!confirmed) return;

    // Validate id to prevent SSRF
    if (!id || typeof id !== 'number' || id <= 0) {
      showToast('Invalid announcement ID', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/announcements/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        showToast('Announcement deleted successfully', 'success');
        fetchAnnouncements();
      } else {
        showToast('Failed to delete announcement', 'error');
      }
    } catch (error) {
      showToast('Failed to delete announcement', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Announcements ({announcements.length})</h2>
        {!showCreateForm && (
          <button onClick={() => setShowCreateForm(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Create Announcement
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateAnnouncementForm
          onSuccess={() => {
            setShowCreateForm(false);
            fetchAnnouncements();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {!showCreateForm && (
        <>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e5e5'
            }}>
              Loading announcements...
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#ff3b30',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e5e5'
            }}>
              {error}
              <br />
              <button onClick={fetchAnnouncements} style={{ marginTop: '10px' }}>Retry</button>
            </div>
          ) : announcements.length > 0 ? (
            <>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="table-container">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>ID</th>
                        <th style={{ width: '250px' }}>Title</th>
                        <th>Message</th>
                        <th style={{ width: '150px' }}>Created At</th>
                        <th style={{ width: '100px' }}>Reads</th>
                        <th style={{ width: '100px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.map((announcement, index) => (
                        <tr key={announcement.id}>
                          <td data-label="ID">{index + 1}</td>
                          <td data-label="Title" style={{ fontWeight: '600', color: '#000' }}>{announcement.title}</td>
                          <td data-label="Message" style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span title={announcement.message}>{announcement.message}</span>
                          </td>
                          <td data-label="Created At" style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(announcement.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td data-label="Reads">
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#f0f0f0', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#333' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                              {announcement.readCount || 0}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => handleDelete(announcement.id)} style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', color: 'white', padding: '7px 14px', fontSize: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginTop: '20px'
                }}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{
                      padding: '8px 16px',
                      background: page === 0 ? '#f0f0f0' : 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      cursor: page === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                    style={{
                      padding: '8px 16px',
                      background: page >= totalPages - 1 ? '#f0f0f0' : 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e5e5'
            }}>
              No announcements found. Click "Create Announcement" to add one.
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CreateAnnouncementForm = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, message })
      });
      if (response.ok) {
        showToast('Announcement created successfully', 'success');
        onSuccess();
      } else {
        showToast('Failed to create announcement', 'error');
      }
    } catch (error) {
      showToast('Failed to create announcement', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="enhanced-form" style={{ marginBottom: '20px' }}>
      <div className="form-header">
        <h3>📢 Create Announcement</h3>
        <p>Broadcast a message to all marketing team members</p>
      </div>
      <div style={{ background: 'white', padding: '24px' }}>
        <div className="form-grid">
          <div className="form-field full-width">
            <label>Title *</label>
            <input
              type="text"
              placeholder="Enter announcement title (3-200 characters)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={200}
            />
          </div>
          <div className="form-field full-width">
            <label>Message *</label>
            <textarea
              placeholder="Enter announcement message (10-5000 characters)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              maxLength={5000}
              style={{ minHeight: '120px' }}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Create Announcement</button>
        </div>
      </div>
    </form>
  );
};

export default AnnouncementsSection;
