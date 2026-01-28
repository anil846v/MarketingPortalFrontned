import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:9090/api/marketing';

const Home = ({ setActiveTab, setStatusFilter }) => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/school-visits`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        const visits = data || [];
        setStats({
          total: visits.length,
          pending: visits.filter(v => v.status === 'PENDING').length,
          accepted: visits.filter(v => v.status === 'ACCEPTED').length,
          rejected: visits.filter(v => v.status === 'REJECTED').length
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);


  const StatCard = ({ icon, label, value, gradient, statusFilter }) => (
    <div
      className="stat-card"
      onClick={() => {
        if (statusFilter) {
          // Pass the filter value directly to setActiveTab handler
          setActiveTab('visits', statusFilter);
        }
      }}
      style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: statusFilter ? 'pointer' : 'default'
      }}
      onMouseEnter={(e) => {
        if (statusFilter) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (statusFilter) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        }
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '12px',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '500',
          color: '#666',
          marginBottom: '4px'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#000',
          lineHeight: 1
        }}>
          {loading ? '...' : value}
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#000', marginBottom: '8px' }}>
          Marketing Dashboard
        </h2>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <StatCard
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
          label="Total Visits"
          value={stats.total}

          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          statusFilter="ALL" // Pass status for filtering

        />
        <StatCard
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="Pending"
          value={stats.pending}
          gradient="linear-gradient(135deg, #ffc107 0%, #ff9800 100%)"
          statusFilter="PENDING"

        />
        <StatCard
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          label="Accepted"
          value={stats.accepted}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          statusFilter="ACCEPTED"

        />
        <StatCard
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
          label="Rejected"
          value={stats.rejected}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          statusFilter="REJECTED"

        />
      </div>

      <div className="quick-actions" style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#000', marginBottom: '16px' }}>Quick Actions</h3>
        <div className="action-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <button
            className="action-btn"
            onClick={() => setActiveTab('visits', null, true)}
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New School Visit
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(240, 147, 251, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(240, 147, 251, 0.4)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            View Announcements
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 172, 254, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.4)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Message Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;