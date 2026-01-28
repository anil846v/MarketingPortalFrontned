import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';
import './assets/AdminDashboard.css';
import './AdminDashboard/adminmobile.css';
import SideMenu from './AdminDashboard/SideMenu';
import HomeSection from './AdminDashboard/Home';
import UsersSection from './AdminDashboard/Users';
import VisitsSection from './AdminDashboard/SchoolVisits';
import OrdersSection from './AdminDashboard/Order';
import ModulesSection from './AdminDashboard/Modules';
import AnnouncementsSection from './AdminDashboard/Announcemnts';
import MessagesSection from './AdminDashboard/Messages';
import ProfileSection from './AdminDashboard/Profile';
import UserWiseVisitsSection from './AdminDashboard/UserWiseVisits';
import MobileBottomNav from './AdminDashboard/MobileBottomNav';
import ToastContainer from './components/ToastContainer';
import ConfirmationProvider from './components/ConfirmationProvider';
import { authFetch } from './utils/authFetch';

const adminMenuItems = [
  { id: 'home', label: 'Home', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  { id: 'users', label: 'Users', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { id: 'user-wise-visits', label: 'User-Wise Visits', icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' },
  { id: 'visits', label: 'School Visits', icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { id: 'orders', label: 'Orders', icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>' },
  { id: 'modules', label: 'Modules', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
  { id: 'announcements', label: 'Announcements', icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
  { id: 'messages', label: 'Messages', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
  { id: 'profile', label: 'Profile', icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' }
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const navigate = useNavigate();
  const sessionCheckInterval = 5 * 60 * 1000; // 5 minutes

  // Handle tab switching with optional form opening
  const handleSetActiveTab = (tabId, openForm = false) => {
    if (openForm) {
      setShowNewUserForm(true);
    } else {
      setShowNewUserForm(false);
    }
    setActiveTab(tabId);
  };

  // Validate session on component mount and set up periodic checks
  useEffect(() => {
    const validateSession = async () => {
      try {
        await authFetch(`${API_BASE_URL}/auth/validate`, { method: 'POST' });
      } catch (error) {
        // authFetch already redirects on 401/403
        console.error('Session validation error:', error);
      }
    };

    // Check on mount
    validateSession();

    // Set up periodic session checks (every 5 minutes)
    const intervalId = setInterval(() => {
      validateSession();
    }, sessionCheckInterval);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    const { confirmAction } = await import('./components/ConfirmationProvider');
    const confirmed = await confirmAction(
      'Logout',
      'Are you sure you want to logout?',
      'Logout',
      'Cancel',
      'warning'
    );

    if (confirmed) {
      try {
        await authFetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST'
        });
      } catch (error) {
        // Ignore errors, authFetch will handle redirects
      }
      window.location.replace('/login');
    }
  };

  return (
    <div className="admin-layout">
      <SideMenu
        title="Admin"
        menuItems={adminMenuItems}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="main-content">
        <header className="top-header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            id="mobile-menu-toggle"
          >
            ☰
          </button>
          <h1>GMMC Marketing Portal</h1>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </header>

        <main className={`content-area ${activeTab === 'messages' ? 'no-padding' : ''}`}>
          {activeTab === 'home' && <HomeSection setActiveTab={handleSetActiveTab} />}
          {activeTab === 'users' && <UsersSection showNewUserForm={showNewUserForm} setShowNewUserForm={setShowNewUserForm} />}
          {activeTab === 'user-wise-visits' && <UserWiseVisitsSection />}
          {activeTab === 'visits' && <VisitsSection />}
          {activeTab === 'orders' && <OrdersSection />}
          {activeTab === 'modules' && <ModulesSection />}
          {activeTab === 'announcements' && <AnnouncementsSection />}
          {activeTab === 'messages' && <MessagesSection setSidebarOpen={setSidebarOpen} />}
          {activeTab === 'profile' && <ProfileSection />}
        </main>
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        setSidebarOpen={setSidebarOpen}
        sidebarOpen={sidebarOpen}
      />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <ToastContainer />
      <ConfirmationProvider />
    </div>
  );
};

export default AdminDashboard;
