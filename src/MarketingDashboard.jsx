import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';
import './assets/AdminDashboard.css';
import './assets/marketingdashabordmobilelayout.css';
import SideMenu from './AdminDashboard/SideMenu';
import HomeSection from './MarketingDashboard/Home';
import SchoolVisitsSection from './MarketingDashboard/SchoolVisits';
import AnnouncementsSection from './MarketingDashboard/Announcements';
import MessagesSection from './MarketingDashboard/Messages';
import ProfileSection from './MarketingDashboard/Profile';
import ToastContainer from './components/ToastContainer';
import ConfirmationProvider from './components/ConfirmationProvider';
import { authFetch } from './utils/authFetch';

const marketingMenuItems = [
  { id: 'home', label: 'Home', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  { id: 'visits', label: 'School Visits', icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { id: 'announcements', label: 'Announcements', icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
  { id: 'messages', label: 'Messages', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
  { id: 'profile', label: 'Profile', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' }
];

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userFullName, setUserFullName] = useState('Marketing');
  const [statusFilter, setStatusFilter] = useState(null);
  const [showNewVisitForm, setShowNewVisitForm] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();


  const handleSetActiveTab = (tabId, filterValue, openForm = false) => {
    if (tabId !== 'visits') {
      setStatusFilter(null);
      setShowNewVisitForm(false);
    } else if (openForm) {
      setStatusFilter('ALL');
      setShowNewVisitForm(true);
    } else if (filterValue) {
      setStatusFilter(filterValue);
      setShowNewVisitForm(false);
    } else if (statusFilter === null) {
      setStatusFilter('ALL');
      setShowNewVisitForm(false);
    }
    setActiveTab(tabId);
  };

  useEffect(() => {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const handleResize = () => {
      if (toggleBtn) toggleBtn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) setSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    let intervalId;

    const init = async () => {
      try {
        await authFetch(`${API_BASE_URL}/auth/validate`, { method: 'POST' }, () => setSessionExpired(true));
        await fetchUserProfile();
      } catch {}
    };

    init();
    intervalId = setInterval(init, 2 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/marketing/profile`, {}, () => setSessionExpired(true));
      const data = await response.json();
      if (response.ok && data.fullName) setUserFullName(data.fullName);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    const { confirmAction } = await import('./components/ConfirmationProvider');
    const confirmed = await confirmAction('Logout', 'Are you sure you want to logout?', 'Logout', 'Cancel', 'warning');
    if (confirmed) {
      try {
        await authFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
      } catch {}
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="admin-layout" style={{ width: '100%', height: '100%' }}>
      <SideMenu 
        title={userFullName}
        menuItems={marketingMenuItems}
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
            style={{ display: 'none' }}
            id="mobile-menu-toggle"
          >
            ☰
          </button>
          <h1>GMMC SchoolsVisited Portal</h1>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </header>

        <main className={`content-area ${activeTab === 'messages' ? 'no-padding' : ''}`}
          onClick={() => { if (sidebarOpen && window.innerWidth <= 768) setSidebarOpen(false); }}
        >
          {activeTab === 'home' && <HomeSection setActiveTab={handleSetActiveTab} setStatusFilter={setStatusFilter} />}
          {activeTab === 'visits' && <SchoolVisitsSection statusFilter={statusFilter} setStatusFilter={setStatusFilter} showNewVisitForm={showNewVisitForm} setShowNewVisitForm={setShowNewVisitForm} />}
          {activeTab === 'announcements' && <AnnouncementsSection />}
          {activeTab === 'messages' && <MessagesSection />}
          {activeTab === 'profile' && <ProfileSection />}
        </main>
      </div>
      
      <ToastContainer />
      <ConfirmationProvider />
    </div>
  );
};

export default MarketingDashboard;
