import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/ToastContainer';
import { API_BASE_URL } from '../config';
import { sanitizeInput } from '../utils/validation';

const ProfileSection = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    gender: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          password: '',
          gender: data.gender || ''
        });
      } else {
        showToast('Failed to fetch profile', 'error');
      }
    } catch (error) {
      showToast('Unable to connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate username
    if (formData.username && formData.username.length < 3) {
      showToast('Username must be at least 3 characters', 'error');
      return;
    }

    // Validate password if provided
    if (formData.password && formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const payload = {};
      if (formData.username !== profile.username) {
        payload.username = sanitizeInput(formData.username);
      }
      if (formData.password) {
        payload.password = formData.password;
      }
      if (formData.gender !== profile.gender) {
        payload.gender = formData.gender;
      }

      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Profile updated successfully', 'success');
        setEditing(false);
        fetchProfile();
      } else {
        showToast('Error: ' + (data.error || 'Failed to update profile'), 'error');
      }
    } catch (error) {
      showToast('Unable to connect to server', 'error');
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;
  if (!profile) return <div>Failed to load profile</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <h2>Admin Profile</h2>
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        {!editing ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                  User ID
                </label>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#000', marginTop: '4px' }}>
                  {profile.userId}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                  Username
                </label>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#000', marginTop: '4px' }}>
                  {profile.username}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                  Role
                </label>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#000', marginTop: '4px' }}>
                  {profile.role}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                  Status
                </label>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#000', marginTop: '4px' }}>
                  {profile.status}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                  Gender
                </label>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#000', marginTop: '4px' }}>
                  {profile.gender || 'Not specified'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                  Created At
                </label>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#000', marginTop: '4px' }}>
                  {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  New Password (optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    username: profile.username || '',
                    password: '',
                    gender: profile.gender || ''
                  });
                }}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  color: '#666',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;