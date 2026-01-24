import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:9090/api/marketing';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!profile) return <div>Profile not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f093fb" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#000' }}>My Profile</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Personal Information */}
       <div style={{
  background: '#fff',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #e5e5e5',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
   <img
  src={`http://localhost:9090${profile.profilePhotoPath}`}   // ← remove /api/marketing
  alt="Profile"
  style={{
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #667eea',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }}
/>
    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#000' }}>
      Personal Information
    </h3>
  </div>

  <div style={{ display: 'grid', gap: '16px' }}>
    <div>
      <label style={{ 
        fontSize: '12px', 
        fontWeight: '600',
         color: '#666',
          textTransform: 'uppercase' }}>Full Name</label>
      <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.fullName || 'N/A'}</div>
    </div>
    <div>
      
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Email</label>
      <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.email || 'N/A'}</div>
    </div>
    <div>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Phone</label>
      <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.phoneNumber || 'N/A'}</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Age</label>
        <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.age || 'N/A'}</div>
      </div>
      <div>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Gender</label>
        <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.gender || 'N/A'}</div>
      </div>
    </div>
    <div>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Address</label>
      <div style={{ fontSize: '14px', color: '#000', marginTop: '4px', lineHeight: '1.5' }}>{profile.address || 'N/A'}</div>
    </div>
  </div>
</div>


        {/* Work Information */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e5e5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px'
            }}>
              💼
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#000' }}>Work Information</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>User ID</label>
              <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.userId}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Designation</label>
              <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.designation || 'Marketing Executive'}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Assigned Region</label>
              <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.assignedRegion || 'N/A'}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Target Districts</label>
              <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.targetDistricts || 'N/A'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Role</label>
                <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>{profile.role}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Status</label>
                <span style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: profile.status === 'Approved' ? '#d1f2eb' : '#fff3cd',
                  color: profile.status === 'Approved' ? '#0f5132' : '#856404'
                }}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e5e5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px'
            }}>
              ⚙️
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#000' }}>Account Information</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Member Since</label>
              <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>
                {profile.memberSince ? new Date(profile.memberSince).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Last Updated</label>
              <div style={{ fontSize: '14px', color: '#000', marginTop: '4px' }}>
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
    </div>
    
  );
};

export default Profile;