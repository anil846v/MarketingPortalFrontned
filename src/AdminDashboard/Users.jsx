import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/ToastContainer';
import { confirmAction } from '../components/ConfirmationProvider';
import { API_BASE_URL } from '../config';
import { validateEmail, validatePhone, sanitizeInput } from '../utils/validation';
import '../assets/userwisevistsstyle.css';

const UsersSection = ({ showNewUserForm, setShowNewUserForm }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(showNewUserForm || false);
  const [editingUser, setEditingUser] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Sync showNewUserForm prop with local state
  useEffect(() => {
    if (showNewUserForm) {
      setShowRegisterForm(true);
      // Reset the parent state after using it
      if (setShowNewUserForm) {
        setShowNewUserForm(false);
      }
    }
  }, [showNewUserForm, setShowNewUserForm]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/marketing-users`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        showToast('Failed to fetch users', 'error');
      }
    } catch (error) {
      showToast('Unable to connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = await confirmAction(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      'Delete',
      'Cancel',
      'danger'
    );

    if (!confirmed) return;

    // Validate userId to prevent SSRF
    if (!userId || typeof userId !== 'number' || userId <= 0) {
      showToast('Invalid user ID', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete-marketing-user/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        showToast('User deleted successfully', 'success');
        fetchUsers();
      } else {
        showToast('Failed to delete user', 'error');
      }
    } catch (error) {
      showToast('Unable to connect to server', 'error');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    // Validate userId to prevent SSRF
    if (!userId || typeof userId !== 'number' || userId <= 0) {
      showToast('Invalid user ID', 'error');
      return;
    }

    // Validate status value
    const validStatuses = ['Approved', 'Pending', 'Rejected'];
    if (!validStatuses.includes(newStatus)) {
      showToast('Invalid status value', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/change-user-status/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        showToast('Status updated successfully', 'success');
        fetchUsers();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Unable to connect to server', 'error');
    }
  };

  if (loading) return <LoadingSpinner message="Fetching users..." />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <h2>Marketing Users ({users.length})</h2>
      </div>
      {!showRegisterForm && (
        <button onClick={() => {
          setShowRegisterForm(true);
          setEditingUser(null);
        }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Register New User
        </button>
      )}

      {showRegisterForm && (
        <RegisterForm
          onSuccess={() => {
            setShowRegisterForm(false);
            fetchUsers();
          }}
          onCancel={() => setShowRegisterForm(false)}
        />
      )}

      {editingUser && (
        <UpdateForm
          userId={editingUser}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
          onCancel={() => setEditingUser(null)}
        />
      )}

      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Phone</th>
              <th>Region</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <>
                <tr key={user.userId}>
                  <td>{index + 1}</td>
                  <td
                    onClick={() => setExpandedUser(expandedUser === user.userId ? null : user.userId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="uw-executive-cell">
                      {user.profilePhotoPath ? (
                        <img
                          src={`${API_BASE_URL}${user.profilePhotoPath}`}
                          alt=""
                          className="uw-profile-img"
                        />
                      ) : (
                        <div className="uw-profile-placeholder">
                          {user.fullName?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="uw-executive-name">{user.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: '150px', minWidth: '150px' }}>
                    <button
                      onClick={() => setExpandedUser(expandedUser === user.userId ? null : user.userId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#667eea',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '14px',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0'
                      }}
                    >
                      {user.username}
                    </button>
                  </td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.assignedRegion}</td>
                  <td>
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.userId, e.target.value)}
                      className="status-select"
                    >
                      <option value="Approved">Enable</option>
                      <option value="Pending">Disable</option>
                      <option value="Rejected">Block</option>
                    </select>
                  </td>
                  <td style={{ minWidth: '140px', whiteSpace: 'nowrap' }}>
                    <button onClick={() => {
                      setEditingUser(user.userId);
                      setShowRegisterForm(false);
                      setExpandedUser(null);
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    }} style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '0 4px 0 0' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(user.userId)} style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
                {expandedUser === user.userId && (

                  <tr>
                    <td colSpan="7" style={{ padding: '0', background: '#f8f9fa' }}>
                      <div style={{
                        padding: '20px',
                        background: '#fff',
                        margin: '8px',
                        borderRadius: '8px',
                        border: '1px solid #e5e5e5',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        position: 'relative'
                      }}>

                        <button
                          onClick={() => setExpandedUser(null)}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#f5f5f5',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            color: '#666'
                          }}
                          title="Close"
                        >
                          ×
                        </button>
                        {user.profilePhotoPath && (
                          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-block', padding: '1px', background: '#fff', border: '1px solid #ddd', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                              <img
                                src={`${API_BASE_URL}${user.profilePhotoPath}`}
                                alt="Passport Size Profile"
                                style={{
                                  width: '120px',
                                  height: '150px',
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                              />
                              {/* <div style={{ marginTop: '8px', fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Passport Size Photo</div> */}
                            </div>
                          </div>
                        )}

                        <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>User Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                          <div>
                            <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Personal Information</strong>
                            <div style={{ marginTop: '8px', fontSize: '14px' }}>
                              <p style={{ margin: '4px 0' }}><strong>Full Name:</strong> {user.fullName || 'N/A'}</p>
                              <p style={{ margin: '4px 0' }}><strong>Email:</strong> {user.email || 'N/A'}</p>
                              <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {user.phoneNumber || 'N/A'}</p>
                              <p style={{ margin: '4px 0' }}><strong>Age:</strong> {user.age || 'N/A'}</p>
                              <p style={{ margin: '4px 0' }}><strong>Gender:</strong> {user.gender || 'N/A'}</p>
                            </div>

                          </div>
                          <div>
                            <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Work Information</strong>
                            <div style={{ marginTop: '8px', fontSize: '14px' }}>
                              <p style={{ margin: '4px 0' }}><strong>Username:</strong> {user.username}</p>
                              <p style={{ margin: '4px 0' }}><strong>User ID:</strong> {user.userId}</p>
                              <p style={{ margin: '4px 0' }}><strong>Status:</strong>

                                <span style={{
                                  marginLeft: '8px',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  background: user.status === 'Approved' ? '#d1f2eb' : user.status === 'Pending' ? '#fff3cd' : '#f8d7da',
                                  color: user.status === 'Approved' ? '#0f5132' : user.status === 'Pending' ? '#856404' : '#842029'
                                }}>
                                  {user.status}
                                </span>
                              </p>
                              <p style={{ margin: '4px 0' }}><strong>Assigned Region:</strong> {user.assignedRegion || 'N/A'}</p>
                              <p style={{ margin: '4px 0' }}><strong>Target Districts:</strong> {user.targetDistricts || 'N/A'}</p>
                            </div>
                          </div>
                          <div>
                            <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Address</strong>
                            <div style={{ marginTop: '8px', fontSize: '14px' }}>
                              <p style={{ margin: '4px 0', lineHeight: '1.5' }}>{user.address || 'No address provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RegisterForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phoneNumber: '',
    age: '', gender: 'Male', address: '', assignedRegion: '', targetDistricts: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // 🔥 FIXED: Initialize FormData
  const formDataToSend = new FormData();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }

    if (!formData.email.trim()) {
      showToast('Email is required', 'error');
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      showToast('Phone number is required', 'error');
      return;
    }

    if (!validatePhone(formData.phoneNumber)) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }

    if (!formData.age || formData.age < 18 || formData.age > 100) {
      showToast('Age must be between 18 and 100', 'error');
      return;
    }

    try {
      // 🔥 FIXED: Create fresh FormData for each submission
      const formDataToSend = new FormData();

      const payload = {
        fullName: sanitizeInput(formData.fullName),
        email: sanitizeInput(formData.email),
        password: formData.password,
        phoneNumber: sanitizeInput(formData.phoneNumber),
        age: parseInt(formData.age),
        gender: formData.gender,
        address: sanitizeInput(formData.address),
        assignedRegion: sanitizeInput(formData.assignedRegion),
        targetDistricts: sanitizeInput(formData.targetDistricts)
      };

      // 🔥 Append JSON as Blob for @RequestPart("userData")
      formDataToSend.append('userData', new Blob([JSON.stringify(payload)], {
        type: 'application/json'
      }));

      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const response = await fetch(`${API_BASE_URL}/admin/register-marketing-user`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'User created successfully', 'success');
        // Reset form including photo
        setFormData({
          fullName: '', email: '', password: '', phoneNumber: '',
          age: '', gender: 'Male', address: '', assignedRegion: '', targetDistricts: ''
        });
        setPhotoFile(null);
        setPhotoPreview(null);
        onSuccess();
      } else {
        showToast('Error: ' + (data.error || 'Failed to create user'), 'error');
      }
    } catch (error) {
      showToast('Failed to create user. Please try again.', 'error');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Photo must be less than 5MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="enhanced-form">
      <div className="form-header">
        <h3>✨ Create New Marketing User</h3>
        <p>Fill in the details to register a new marketing team member</p>
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label>Full Name *</label>
          <input type="text" placeholder="Enter full name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
        </div>
        <div className="form-field">
          <label>Email Address *</label>
          <input type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>
        <div className="form-field">
          <label>Password *</label>
          <input type="password" placeholder="Create password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        </div>
        <div className="form-field">
          <label>Phone Number *</label>
          <input type="tel" placeholder="Enter phone number" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} required />
        </div>
        <div className="form-field">
          <label>Age *</label>
          <input type="number" placeholder="Enter age" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required />
        </div>
        <div className="form-field">
          <label>Gender</label>
          <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="form-field">
          <label>Assigned Region</label>
          <input type="text" placeholder="Enter assigned region" value={formData.assignedRegion} onChange={(e) => setFormData({ ...formData, assignedRegion: e.target.value })} />
        </div>
        <div className="form-field">
          <label>Target Districts</label>
          <input type="text" placeholder="Enter target districts" value={formData.targetDistricts} onChange={(e) => setFormData({ ...formData, targetDistricts: e.target.value })} />
        </div>
        <div className="form-field full-width">
          <label>Address</label>
          <textarea placeholder="Enter complete address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
        </div>
        <div className="form-field full-width">
          <label>Profile Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {photoPreview && (
            <div style={{ marginTop: '8px' }}>
              <img
                src={photoPreview}
                alt="Preview"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5'
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                style={{
                  marginLeft: '12px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  background: '#f8d7da',
                  color: '#842029',
                  border: '1px solid #f5c2c7',
                  borderRadius: '4px'
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Create User</button>
      </div>
    </form>
  );
};

const UpdateForm = ({ userId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '', password: '', phoneNumber: '', age: '', email: '', gender: 'Male',
    address: '', assignedRegion: '', targetDistricts: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/marketing-users`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        const user = data.users.find(u => u.userId === userId);
        if (user) {
          setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            password: '',
            phoneNumber: user.phoneNumber || '',
            age: user.age || '',
            gender: user.gender || 'Male',
            address: user.address || '',
            assignedRegion: user.assignedRegion || '',
            targetDistricts: user.targetDistricts || ''
          });
          if (user.profilePhotoPath) {
            setPhotoPreview(`${API_BASE_URL}${user.profilePhotoPath}`);
          }
        }
      } else {
        showToast('Failed to fetch user data', 'error');
      }
    } catch (error) {
      showToast('Unable to connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Photo must be less than 5MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData for multipart request
      const formDataToSend = new FormData();
      const payload = {};

      if (formData.fullName) payload.fullName = sanitizeInput(formData.fullName);
      if (formData.email && validateEmail(formData.email)) payload.email = sanitizeInput(formData.email);
      if (formData.password && formData.password.length >= 6) payload.password = formData.password;
      if (formData.phoneNumber && validatePhone(formData.phoneNumber)) payload.phoneNumber = sanitizeInput(formData.phoneNumber);
      if (formData.age) payload.age = parseInt(formData.age);
      if (formData.gender) payload.gender = formData.gender;
      if (formData.address) payload.address = sanitizeInput(formData.address);
      if (formData.assignedRegion) payload.assignedRegion = sanitizeInput(formData.assignedRegion);
      if (formData.targetDistricts) payload.targetDistricts = sanitizeInput(formData.targetDistricts);

      formDataToSend.append('userData', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const response = await fetch(`${API_BASE_URL}/admin/update-marketing-user/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formDataToSend // multipart/form-data
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'User updated successfully', 'success');
        onSuccess();
      } else {
        showToast('Failed to update user: ' + (data.error || ''), 'error');
      }
    } catch (error) {
      showToast('Unable to connect to server', 'error');
    }
  };

  if (loading) return <div className="loading">Loading user data...</div>;
  return (
    <form onSubmit={handleSubmit} className="enhanced-form edit-form">
      <div className="form-header">
        <h3>✏️ Edit User #{userId}</h3>
        <p>Update user information below. Current values are shown in placeholders.</p>
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label>Full Name</label>
          <input type="text" placeholder={formData.fullName || 'Full Name'} value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
        </div>
        <div className="form-field">
          <label>Email Address</label>
          <input type="email" placeholder={formData.email || 'Email'} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="form-field">
          <label>New Password</label>
          <input type="password" placeholder="Leave empty to keep current password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        </div>
        <div className="form-field">
          <label>Phone Number</label>
          <input type="tel" placeholder={formData.phoneNumber || 'Phone'} value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
        </div>
        <div className="form-field">
          <label>Age</label>
          <input type="number" placeholder={formData.age || 'Age'} value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
        </div>
        <div className="form-field">
          <label>Gender</label>
          <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="form-field">
          <label>Assigned Region</label>
          <input type="text" placeholder={formData.assignedRegion || 'Region'} value={formData.assignedRegion} onChange={(e) => setFormData({ ...formData, assignedRegion: e.target.value })} />
        </div>
        <div className="form-field">
          <label>Target Districts</label>
          <input type="text" placeholder={formData.targetDistricts || 'Districts'} value={formData.targetDistricts} onChange={(e) => setFormData({ ...formData, targetDistricts: e.target.value })} />
        </div>
        <div className="form-field full-width">
          <label>Address</label>
          <textarea placeholder={formData.address || 'Address'} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
        </div>
        {/* 🔥 Photo Upload */}
        <div className="form-field full-width">
          <label>Profile Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoPreview && (
            <div style={{ marginTop: '8px' }}>
              <img src={photoPreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e5e5e5' }} />
              <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px', background: '#f8d7da', color: '#842029', border: '1px solid #f5c2c7', borderRadius: '4px' }}>Remove</button>
            </div>
          )}
        </div>
      </div>
      <div className="form-actions">
        <button type="submit">Update User</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default UsersSection;
