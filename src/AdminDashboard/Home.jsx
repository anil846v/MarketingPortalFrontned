import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// Styles constants for better maintainability
const styles = {
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0
  },
  primaryButton: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  secondaryButton: {
    padding: '12px 20px',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

const HomeSection = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVisits: 0,
    totalOrders: 0,
    activeModules: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [usersRes, visitsRes, ordersRes, modulesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/marketing-users`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/admin/school-visits`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/admin/accepted-orders`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/admin/modules`, { credentials: 'include' })
      ]);

      const [usersData, visitsData, ordersData, modulesData] = await Promise.all([
        usersRes.json(),
        visitsRes.json(),
        ordersRes.json(),
        modulesRes.json()
      ]);

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalVisits: visitsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        activeModules: modulesData?.filter(m => m.isActive).length || 0
      });
    } catch (error) {
      // Silently handle error - stats will show 0
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, label, value, gradient, tabId }) => (
    <div
      style={{ ...styles.statCard }}
      onClick={() => {
        if (tabId) {
          setActiveTab(tabId);
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
      }}
    >
      <div style={{ ...styles.iconContainer, background: gradient }}>
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
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#000', marginBottom: '8px' }}>
          Dashboard Overview
        </h2>

      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          label="Total Marketing Users"
          value={stats.totalUsers}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          tabId="users"
        />
        <StatCard
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
          label="Total School Visits"
          value={stats.totalVisits}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          tabId="visits"
        />
        <StatCard
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          }
          label="Total Orders"
          value={stats.totalOrders}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          tabId="orders"
        />
        <StatCard
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          label="Active Modules"
          value={stats.activeModules}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          tabId="modules"
        />
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e5e5'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#000', marginBottom: '16px' }}>
          Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <button
            onClick={() => setActiveTab('users', true)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            + Create New User
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            style={{
              padding: '12px 20px',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
            }}
          >
            View All Visits
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            style={{
              padding: '12px 20px',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
            }}
          >
            Manage Modules
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;
