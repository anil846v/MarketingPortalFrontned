import { useState, useEffect } from 'react';
import { showToast } from '../components/ToastContainer';
import { confirmAction } from '../components/ConfirmationProvider';
import { API_BASE_URL } from '../config';

const ModalTabs = ({ selectedVisit, getModuleDetails }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '12px 20px',
        background: active ? 'white' : 'transparent',
        border: 'none',
        borderBottom: active ? '3px solid #667eea' : '3px solid transparent',
        color: active ? '#667eea' : '#666',
        fontSize: '13px',
        fontWeight: active ? '600' : '500',
        cursor: 'pointer',
        marginBottom: '-2px',
        transition: 'all 0.2s',
        borderRadius: '4px 4px 0 0'
      }}
      onMouseEnter={(e) => {
        if (!active) e.target.style.background = '#f5f5f5';
      }}
      onMouseLeave={(e) => {
        if (!active) e.target.style.background = 'transparent';
      }}
    >
      {label}
    </button>
  );

  const DetailCard = ({ label, value }) => (
    <div style={{
      background: 'white',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e5e5'
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: '500',
        color: '#000',
        wordBreak: 'break-word'
      }}>
        {value || 'N/A'}
      </div>
    </div>
  );

  return (
    <>
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '2px solid #e5e5e5',
        marginBottom: '24px',
        background: '#fafafa',
        padding: '0 16px',
        borderRadius: '8px 8px 0 0'
      }}>
        <TabButton id="basic" label="Basic Info" active={activeTab === 'basic'} />
        <TabButton id="contact" label="Contact & School" active={activeTab === 'contact'} />
        <TabButton id="order" label="Order Details" active={activeTab === 'order'} />
        <TabButton id="requirements" label="Requirements" active={activeTab === 'requirements'} />
        <TabButton id="modules" label="Modules" active={activeTab === 'modules'} />
      </div>
      
      <div style={{ padding: '0 16px 16px' }}>
        {activeTab === 'basic' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <DetailCard label="Visit ID" value={selectedVisit.id} />
            <DetailCard label="School Name" value={selectedVisit.schoolName} />
            <DetailCard label="Visit Date" value={selectedVisit.visitedDate} />
            <DetailCard label="Marketing Executive" value={selectedVisit.marketingExecutiveName} />
            <DetailCard label="Location City" value={selectedVisit.locationCity} />
            <DetailCard label="Status" value={selectedVisit.status} />
            <DetailCard label="Created At" value={selectedVisit.createdAt} />
            {selectedVisit.status === 'REJECTED' && selectedVisit.rejectionReason && (
              <div style={{
                gridColumn: '1 / -1',
                padding: '16px',
                background: '#fff0f0',
                border: '1px solid #ffcdd2',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#d32f2f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  Rejection Reason
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#666',
                  wordBreak: 'break-word'
                }}>
                  {selectedVisit.rejectionReason}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'contact' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <DetailCard label="Contact Person" value={selectedVisit.contactPersonName} />
            <DetailCard label="Contact No" value={selectedVisit.contactNo} />
            <DetailCard label="Email ID" value={selectedVisit.emailId} />
            <DetailCard label="School Strength" value={selectedVisit.schoolStrenght} />
            <DetailCard label="Current System" value={selectedVisit.CurrentSystem} />
            <DetailCard label="No Of Users" value={selectedVisit['No Of Users ']} />
          </div>
        )}
        
        {activeTab === 'order' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <DetailCard label="Expected Go Live Date" value={selectedVisit.expectedGoLiveDate} />
            <DetailCard label="Order Booking Date" value={selectedVisit.orderBookingDate} />
            <DetailCard label="Initial Payment" value={selectedVisit.initialPayment} />
            <DetailCard label="Payment Terms" value={selectedVisit.paymentTerms} />
            <DetailCard label="Cost Per Member" value={selectedVisit.costPerMember} />
            <DetailCard label="Budget Range" value={selectedVisit['Budget Range']} />
            <DetailCard label="Payment Gateway Preference" value={selectedVisit['Payment GateWay Preference']} />
            <DetailCard label="Demo Required" value={selectedVisit['Demo Required']} />
            <DetailCard label="Demo Date" value={selectedVisit['Demo Date']} />
            <DetailCard label="Proposal Sent" value={selectedVisit['Proposal Sent']} />
            <DetailCard label="Proposal Date" value={selectedVisit['Proposal date']} />
          </div>
        )}
        
        {activeTab === 'requirements' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <DetailCard label="Data Migration Required" value={selectedVisit['Data Migration Required']} />
            <DetailCard label="Custom Features Required" value={selectedVisit['Custom Features Required']} />
            <DetailCard label="RFID Integration" value={selectedVisit['RFID Integration']} />
            <DetailCard label="ID Cards" value={selectedVisit['Id Cards']} />
          </div>
        )}
        
        {activeTab === 'modules' && (
          <div>
            {selectedVisit.selectedModules && selectedVisit.selectedModules.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {selectedVisit.selectedModules.map((module, idx) => {
                  const moduleDetails = getModuleDetails(module.moduleId);
                  return (
                    <div key={idx} style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e5e5',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#000'
                      }}>
                        {moduleDetails.moduleName}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#666',
                        lineHeight: '1.4'
                      }}>
                        {moduleDetails.description}
                      </div>
                      {module.remarks && (
                        <div style={{
                          fontSize: '12px',
                          color: '#333',
                          fontStyle: 'italic',
                          marginTop: '4px',
                          padding: '8px',
                          background: '#f8f9fa',
                          borderRadius: '4px'
                        }}>
                          <strong>Remarks:</strong> {module.remarks}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e5e5'
              }}>
                No modules selected
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const VisitsSection = () => {
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [modules, setModules] = useState([]);
  const [hoveredVisitId, setHoveredVisitId] = useState(null);

  useEffect(() => {
    fetchVisits();
    fetchModules();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/school-visits`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setVisits(data);
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

  const handleDeleteVisit = async (visitId) => {
    const confirmed = await confirmAction(
      'Delete Rejected Visit',
      'Are you sure you want to delete this rejected school visit? This action cannot be undone.',
      'Delete',
      'Cancel',
      'danger'
    );
    
    if (!confirmed) return;
    
    // Validate visitId to prevent SSRF
    if (!visitId || typeof visitId !== 'number' || visitId <= 0) {
      showToast('Invalid visit ID', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/school-visits/${encodeURIComponent(visitId)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        showToast('Rejected school visit deleted successfully', 'success');
        fetchVisits();
      } else {
        const error = await response.json();
        showToast('Error: ' + (error.error || 'Failed to delete visit'), 'error');
      }
    } catch (error) {
      showToast('Failed to delete visit', 'error');
    }
  };

  if (selectedVisit) {
    return (
      <div>
        <div style={{background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f0f0f0'}}>
            <button onClick={() => setSelectedVisit(null)} style={{padding: '10px 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Visits
            </button>
            <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Visit Details
            </h2>
          </div>
          <ModalTabs selectedVisit={selectedVisit} getModuleDetails={getModuleDetails} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{fontSize: '24px', fontWeight: '600', marginBottom: '20px'}}>All School Visits ({visits.length})</h2>
      <div style={{background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f8f9fa', borderBottom: '2px solid #e5e5e5'}}>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>ID</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>School Name</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Visited Date</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Marketing Executive</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Location</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Status</th>
              <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(visit => (
              <tr 
                key={visit.id} 
                style={{borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s'}} 
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  setHoveredVisitId(visit.id);
                }} 
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  setHoveredVisitId(null);
                }}
              >
                <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{visit.id}</td>
                <td style={{padding: '16px', fontSize: '14px', fontWeight: '600', color: '#000'}}>{visit.schoolName}</td>
                <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{visit.visitedDate}</td>
                <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{visit.marketingExecutiveName}</td>
                <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{visit.locationCity}</td>
                <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{visit.status}</td>
                <td style={{padding: '16px'}}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={() => setSelectedVisit(visit)} style={{padding: '8px 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                      View Details
                    </button>
                    {visit.status === 'REJECTED' && hoveredVisitId === visit.id && (
                      <button 
                        onClick={() => handleDeleteVisit(visit.id)} 
                        style={{
                          padding: '8px 16px', 
                          background: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitsSection;
export { ModalTabs };
