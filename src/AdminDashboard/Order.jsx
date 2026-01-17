import { useState, useEffect } from 'react';
import { ModalTabs } from './SchoolVisits';
import { API_BASE_URL } from '../config';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchModules();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/accepted-orders`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setOrders(data);
    } catch (error) {
      // Silently handle error
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/modules`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setModules(data);
    } catch (error) {
      // Silently handle error
    }
  };

  const getModuleDetails = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    return module || { moduleName: 'Unknown Module', description: 'N/A' };
  };

  if (selectedOrder) {
    return (
      <div>
        <div style={{background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f0f0f0'}}>
            <button onClick={() => setSelectedOrder(null)} style={{padding: '10px 16px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Orders
            </button>
            <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4facfe" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              Order Details
            </h2>
          </div>
          <ModalTabs selectedVisit={selectedOrder} getModuleDetails={getModuleDetails} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{fontSize: '24px', fontWeight: '600', marginBottom: '20px'}}>Accepted Orders ({orders.length})</h2>
      <div style={{background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f8f9fa', borderBottom: '2px solid #e5e5e5'}}>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>ID</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>School Name</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Order Date</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Go Live Date</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Initial Payment</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Status</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{order.id}</td>
                <td style={{padding: '16px', fontSize: '14px', fontWeight: '600', color: '#000'}}>{order.schoolName}</td>
                <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{order.orderBookingDate}</td>
                <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{order.expectedGoLiveDate}</td>
                <td style={{padding: '16px', fontSize: '14px', fontWeight: '600', color: '#4CAF50'}}>₹{order.initialPayment}</td>
                <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{order.status}</td>
                <td style={{padding: '16px'}}>
                  <button onClick={() => setSelectedOrder(order)} style={{padding: '8px 16px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersSection;
