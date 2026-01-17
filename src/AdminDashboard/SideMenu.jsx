const SideMenu = ({ title = 'Admin', menuItems, activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  // Safe icon rendering with dangerouslySetInnerHTML for SVG content
  const renderIcon = (iconString) => {
    return (
      <div 
        className="icon" 
        style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center' }}
        dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconString}</svg>` }}
      />
    );
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>{title}</h2>
        <button className="menu-toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button 
            key={item.id} 
            className={activeTab === item.id ? 'active' : ''} 
            onClick={() => setActiveTab(item.id)}
          >
            {renderIcon(item.icon)}
            <span className="nav-text">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SideMenu;
