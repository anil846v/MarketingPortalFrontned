import React from 'react';
import { Home, Users, ShoppingBag, Menu, Calendar } from 'lucide-react';

const MobileBottomNav = ({ activeTab, setActiveTab, setSidebarOpen, sidebarOpen }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'visits', label: 'Visits', icon: Calendar },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
    ];

    return (
        <>
            <div className="mobile-bottom-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}

                <button
                    className={`nav-item ${sidebarOpen ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <Menu size={20} strokeWidth={sidebarOpen ? 2.5 : 2} />
                    <span>Menu</span>
                </button>
            </div>
        </>
    );
};

export default MobileBottomNav;
