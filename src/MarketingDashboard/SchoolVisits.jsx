import { useState, useEffect } from 'react';
import SchoolVisitWizard from './SchoolVisitWizard';
import { showToast } from '../components/ToastContainer';
import { confirmAction } from '../components/ConfirmationProvider';

const API_BASE_URL = 'http://localhost:9090/api/marketing';

const SchoolVisits = () => {
  const [visits, setVisits] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptingVisitId, setAcceptingVisitId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingVisitId, setRejectingVisitId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [acceptForm, setAcceptForm] = useState({ initialPayment: '', paymentTerms: '', costPerMember: '' });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [visitForm, setVisitForm] = useState({
    schoolName: '', visitedDate: '', marketingExecutiveName: '', locationCity: '',
    contactPersonName: '', designation: '', contactNo: '', emailId: '',
    schoolStrenght: '', boards: '', currentSystem: '', noOfUsers: '',
    dataMigrationRequired: '', customFeaturesRequired: '', rfidIntegration: '',
    idCards: '', paymentGatewayPreference: '', budgetRange: '', expected_goLive_date: '',
    decisionMakerName: '', decisionTimeline: '', demoRequired: '', demoDate: '',
    proposalSent: '', proposalDate: '', selectedModules: []
  });

  useEffect(() => {
    fetchVisits();
    fetchModules();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/school-visits`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) setVisits(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/modules`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) setModules(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        schoolStrenght: formData.schoolStrenght ? parseInt(formData.schoolStrenght) : null,
        noOfUsers: formData.noOfUsers ? parseInt(formData.noOfUsers) : null,
        budgetRange: formData.budgetRange || null,
        selectedModules: formData.selectedModules.map(m => ({ moduleId: m.moduleId, isSelected: 'Yes', remarks: m.remarks || '' }))
      };
      
      // Remove fields that cannot be updated
      if (editingVisit) {
        delete payload.schoolName;
        delete payload.visitedDate;
        delete payload.locationCity;
      }
      
      const url = editingVisit ? `${API_BASE_URL}/school-visit/${editingVisit.id}` : `${API_BASE_URL}/school-visit`;
      const response = await fetch(url, {
        method: editingVisit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        showToast(editingVisit ? 'Visit updated successfully' : 'Visit submitted successfully', 'success');
        setShowForm(false);
        setEditingVisit(null);
        resetForm();
        fetchVisits();
      } else {
        const error = await response.json();
        showToast('Error: ' + (error.error || 'Failed to save visit'), 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to save visit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVisitForm({
      schoolName: '', visitedDate: '', marketingExecutiveName: '', locationCity: '',
      contactPersonName: '', designation: '', contactNo: '', emailId: '',
      schoolStrenght: '', boards: '', currentSystem: '', noOfUsers: '',
      dataMigrationRequired: '', customFeaturesRequired: '', rfidIntegration: '',
      idCards: '', paymentGatewayPreference: '', budgetRange: '', expected_goLive_date: '',
      decisionMakerName: '', decisionTimeline: '', demoRequired: '', demoDate: '',
      proposalSent: '', proposalDate: '', selectedModules: []
    });
  };

  const handleEdit = (visit) => {
    setEditingVisit(visit);
    setVisitForm({
      schoolName: visit.schoolName || '', visitedDate: visit.visitedDate || '',
      marketingExecutiveName: visit.marketingExecutiveName || '', locationCity: visit.locationCity || '',
      contactPersonName: visit.contactPersonName || '', designation: visit.designation || '',
      contactNo: visit.contactNo || '', emailId: visit.emailId || '',
      schoolStrenght: visit.schoolStrenght || '', boards: visit.boards || '',
      currentSystem: visit.CurrentSystem || '', noOfUsers: visit['No Of Users '] || '',
      dataMigrationRequired: visit['Data Migration Required'] || '', customFeaturesRequired: visit['Custom Features Required'] || '',
      rfidIntegration: visit['RFID Integration'] || '', idCards: visit['Id Cards'] || '',
      paymentGatewayPreference: visit['Payment GateWay Preference'] || '', budgetRange: visit['Budget Range'] || '',
      expected_goLive_date: visit.expectedGoLiveDate || '', decisionMakerName: visit.decisionMakerName || '',
      decisionTimeline: visit.decisionTimeline || '', demoRequired: visit['Demo Required'] || '',
      demoDate: visit['Demo Date'] || '', proposalSent: visit['Proposal Sent'] || '',
      proposalDate: visit['Proposal date'] || '', selectedModules: visit.selectedModules?.map(m => m.moduleId) || []
    });
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handleChangeStatus = async (visitId, newStatus) => {
    if (newStatus === 'ACCEPTED') {
      setAcceptingVisitId(visitId);
      setShowAcceptModal(true);
      return;
    }
    
    if (newStatus === 'REJECTED') {
      setRejectingVisitId(visitId);
      setShowRejectModal(true);
      return;
    }
  };

  const handleRejectVisit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      showToast('Rejection reason is required', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { 
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim()
      };
      
      const response = await fetch(`${API_BASE_URL}/change-visit-status/${rejectingVisitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        showToast('Visit rejected successfully', 'success');
        setShowRejectModal(false);
        setRejectingVisitId(null);
        setRejectionReason('');
        fetchVisits();
      } else {
        const responseText = await response.text();
        try {
          const error = JSON.parse(responseText);
          showToast('Error: ' + (error.error || 'Failed to reject visit'), 'error');
        } catch {
          showToast('Error: ' + responseText, 'error');
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to reject visit: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/change-visit-status/${acceptingVisitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'ACCEPTED',
          initialPayment: acceptForm.initialPayment || null,
          paymentTerms: acceptForm.paymentTerms || null,
          costPerMember: acceptForm.costPerMember || null
        })
      });
      if (response.ok) {
        showToast('Order accepted successfully', 'success');
        setShowAcceptModal(false);
        setAcceptingVisitId(null);
        setAcceptForm({ initialPayment: '', paymentTerms: '', costPerMember: '' });
        fetchVisits();
      } else {
        showToast('Failed to accept order', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to accept order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#000' }}>School Visits ({visits.length})</h2>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditingVisit(null); resetForm(); }}
          style={{
            padding: '10px 20px',
            background: showForm ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {showForm ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
          </svg>
          {showForm ? 'Cancel' : 'New Visit'}
        </button>
      </div>

      {showAcceptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Accept Order</h3>
            <form onSubmit={handleAcceptOrder}>
              <div style={{ display: 'grid', gap: '15px' }}>
                <input type="number" placeholder="Initial Payment" value={acceptForm.initialPayment} onChange={(e) => setAcceptForm({ ...acceptForm, initialPayment: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                <input type="text" placeholder="Payment Terms" value={acceptForm.paymentTerms} onChange={(e) => setAcceptForm({ ...acceptForm, paymentTerms: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                <input type="number" placeholder="Cost Per Member" value={acceptForm.costPerMember} onChange={(e) => setAcceptForm({ ...acceptForm, costPerMember: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  {loading ? 'Accepting...' : 'Accept Order'}
                </button>
                <button type="button" onClick={() => { setShowAcceptModal(false); setAcceptingVisitId(null); setAcceptForm({ initialPayment: '', paymentTerms: '', costPerMember: '' }); }} style={{ flex: 1, padding: '12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#dc3545' }}>Reject Visit</h3>
            <form onSubmit={handleRejectVisit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Rejection Reason *</label>
                <textarea 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this visit..."
                  required
                  style={{ 
                    width: '100%', 
                    minHeight: '100px', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setShowRejectModal(false); setRejectingVisitId(null); setRejectionReason(''); }} style={{ flex: 1, padding: '12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  {loading ? 'Rejecting...' : 'Reject Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '8px 16px',
                background: statusFilter === status ? '#667eea' : '#f5f5f5',
                color: statusFilter === status ? '#fff' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s',
                borderRadius: '20px'
              }}
            >
              {status === 'ALL' ? `All (${visits.length})` : `${status.charAt(0) + status.slice(1).toLowerCase()} (${visits.filter(v => v.status === status).length})`}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <SchoolVisitWizard
          modules={modules}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingVisit(null); }}
          editingVisit={editingVisit}
          loading={loading}
        />
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {visits.filter(v => statusFilter === 'ALL' || v.status === statusFilter).map(visit => (
          <div key={visit.id} style={{ border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#000' }}>{visit.schoolName}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', color: '#666', fontSize: '14px' }}>
                  <p style={{ margin: '4px 0' }}><strong>Location:</strong> {visit.locationCity}</p>
                  <p style={{ margin: '4px 0' }}><strong>Contact:</strong> {visit.contactPersonName}</p>
                  <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {visit.contactNo}</p>
                  <p style={{ margin: '4px 0' }}><strong>Visit Date:</strong> {visit.visitedDate}</p>
                  <p style={{ margin: '4px 0' }}><strong>Executive:</strong> {visit.marketingExecutiveName}</p>
                </div>
                {visit.selectedModules && visit.selectedModules.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <strong style={{ fontSize: '14px' }}>Modules:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {visit.selectedModules.map(module => {
                        const mod = modules.find(m => m.id === module.moduleId);
                        return mod ? <span key={module.moduleId} style={{ background: '#e8eaf6', color: '#667eea', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>{mod.moduleName}</span> : null;
                      })}
                    </div>
                  </div>
                )}
                {visit.status === 'REJECTED' && visit.rejectionReason && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#d32f2f' }}>Rejection Reason:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>{visit.rejectionReason}</p>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: visit.status === 'PENDING' ? '#fff3cd' : visit.status === 'ACCEPTED' ? '#d1f2eb' : '#f8d7da', color: visit.status === 'PENDING' ? '#856404' : visit.status === 'ACCEPTED' ? '#0f5132' : '#842029' }}>{visit.status}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEdit(visit)} style={{ padding: '6px 12px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  {visit.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleChangeStatus(visit.id, 'ACCEPTED')} style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Accept</button>
                      <button onClick={() => handleChangeStatus(visit.id, 'REJECTED')} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {visits.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <p style={{ fontSize: '16px' }}>No school visits recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolVisits;
