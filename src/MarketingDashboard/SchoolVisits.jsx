import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SchoolVisitWizard from './SchoolVisitWizard';
import { showToast } from '../components/ToastContainer';
import './SchoolVisits.css';

const API_BASE_URL = 'http://localhost:9090/api/marketing';

const SchoolVisits = ({ statusFilter: propStatusFilter, setStatusFilter: setPropStatusFilter, showNewVisitForm, setShowNewVisitForm }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [visits, setVisits] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(showNewVisitForm || false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptingVisitId, setAcceptingVisitId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingVisitId, setRejectingVisitId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [acceptForm, setAcceptForm] = useState({ initialPayment: '', paymentTerms: '', costPerMember: '' });

  const [statusFilter, setStatusFilter] = useState(() => {
    const urlFilter = searchParams.get('status');
    if (urlFilter && ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].includes(urlFilter)) {
      return urlFilter;
    }
    if (propStatusFilter && ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].includes(propStatusFilter)) {
      return propStatusFilter;
    }
    return 'ALL';
  });

  // Update filter when prop changes
  useEffect(() => {
    if (propStatusFilter && ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].includes(propStatusFilter)) {
      setStatusFilter(propStatusFilter);
    }
  }, [propStatusFilter]);

  // Sync state with URL params
  useEffect(() => {
    const urlFilter = searchParams.get('status');
    if (urlFilter && urlFilter !== statusFilter && ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].includes(urlFilter)) {
      setStatusFilter(urlFilter);
    }
  }, [searchParams, statusFilter]);

  // Sync showNewVisitForm prop with local state
  useEffect(() => {
    if (showNewVisitForm) {
      setShowForm(true);
      if (setShowNewVisitForm) {
        setShowNewVisitForm(false);
      }
    }
  }, [showNewVisitForm, setShowNewVisitForm]);

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
      console.error('Error fetching visits:', error);
      showToast('Failed to fetch visits', 'error');
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/modules`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const cleanPayload = (obj) => {
    const cleaned = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        cleaned[key] = value;
      } else if (value === '' || value === undefined) {
        cleaned[key] = null;
      } else {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = cleanPayload({
        ...formData,
        schoolStrenght: formData.schoolStrenght ? parseInt(formData.schoolStrenght) : null,
        noOfUsers: formData.noOfUsers ? parseInt(formData.noOfUsers) : null,
        selectedModules: formData.selectedModules.map(m => ({ moduleId: m.moduleId, isSelected: 'Yes', remarks: m.remarks || '' }))
      });

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
        fetchVisits();
      } else {
        const error = await response.json();
        showToast('Error: ' + (error.error || 'Failed to save visit'), 'error');
      }
    } catch (error) {
      console.error('Error submitting visit:', error);
      showToast('Failed to save visit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (visit) => {
    setEditingVisit(visit);
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handleChangeStatus = (visitId, newStatus) => {
    if (newStatus === 'ACCEPTED') {
      setAcceptingVisitId(visitId);
      setShowAcceptModal(true);
    } else if (newStatus === 'REJECTED') {
      setRejectingVisitId(visitId);
      setShowRejectModal(true);
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
      const payload = { status: 'REJECTED', rejectionReason: rejectionReason.trim() };
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
        const error = await response.json();
        showToast('Error: ' + (error.error || 'Failed to reject visit'), 'error');
      }
    } catch (error) {
      showToast('Failed to reject visit', 'error');
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
      showToast('Failed to accept order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setSearchParams({ status: newStatus });
  };

  return (
    <div className="school-visits-container">
      {showAcceptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Accept Order</h3>
            <form onSubmit={handleAcceptOrder}>
              <div className="form-group">
                <label className="form-label">Initial Payment</label>
                <input type="number" className="form-input" placeholder="e.g. 5000" value={acceptForm.initialPayment} onChange={(e) => setAcceptForm({ ...acceptForm, initialPayment: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <textarea className="form-textarea" placeholder="Describe payment milestones..." value={acceptForm.paymentTerms} onChange={(e) => setAcceptForm({ ...acceptForm, paymentTerms: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Cost Per Member</label>
                <input type="number" className="form-input" placeholder="e.g. 150" value={acceptForm.costPerMember} onChange={(e) => setAcceptForm({ ...acceptForm, costPerMember: e.target.value })} />
              </div>
              <div className="card-actions">
                <button type="button" className="btn-action" style={{ background: '#cbd5e0', color: '#4a5568' }} onClick={() => { setShowAcceptModal(false); setAcceptingVisitId(null); setAcceptForm({ initialPayment: '', paymentTerms: '', costPerMember: '' }); }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn-action btn-accept">{loading ? 'Processing...' : 'Accept Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ color: '#e53e3e' }}>Reject Visit</h3>
            <form onSubmit={handleRejectVisit}>
              <div className="form-group">
                <label className="form-label">Reason for Rejection *</label>
                <textarea className="form-textarea" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Please provide a valid reason..." required />
              </div>
              <div className="card-actions">
                <button type="button" className="btn-action" style={{ background: '#cbd5e0', color: '#4a5568' }} onClick={() => { setShowRejectModal(false); setRejectingVisitId(null); setRejectionReason(''); }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn-action btn-reject">{loading ? 'Processing...' : 'Reject Visit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="sticky-header-container">
        <div className="header-section">
          <div className="header-title-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#000' }}>School Visits ({visits.length})</h2>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingVisit(null); }}
            className={`btn-new-visit ${showForm ? 'cancel' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {showForm ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>}
            </svg>
            {showForm ? 'Cancel' : 'New Visit'}
          </button>
        </div>

        {!showForm && (
          <div className="filter-container">
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              >
                {status === 'ALL' ? `All Visits (${visits.length})` : `${status.charAt(0) + status.slice(1).toLowerCase()} (${visits.filter(v => v.status === status).length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {showForm ? (
        <SchoolVisitWizard
          modules={modules}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingVisit(null); }}
          editingVisit={editingVisit}
          loading={loading}
        />
      ) : (
        <div className="visits-grid">
          {visits
            .filter(v => statusFilter === 'ALL' || v.status === statusFilter)
            .map(visit => (
              <VisitCard
                key={visit.id}
                visit={visit}
                modules={modules}
                onEdit={handleEdit}
                onStatusChange={handleChangeStatus}
              />
            ))}
        </div>
      )}

      {!showForm && visits.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', margin: '40px 0' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <p style={{ marginTop: '16px', fontSize: '18px', color: '#718096', fontWeight: '500' }}>No school visits recorded yet</p>
        </div>
      )}
    </div>
  );
};

const VisitCard = ({ visit, modules, onEdit, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className={`visit-card ${visit.status.toLowerCase()}`}>
      <div className="visit-card-header">
        <h3 className="school-name">{visit.schoolName}</h3>
        <span className={`status-badge ${visit.status.toLowerCase()}`}>{visit.status}</span>
      </div>

      <div className="card-tabs">
        <button onClick={() => setActiveTab('general')} className={`card-tab-btn ${activeTab === 'general' ? 'active' : ''}`}>Info</button>
        <button onClick={() => setActiveTab('technical')} className={`card-tab-btn ${activeTab === 'technical' ? 'active' : ''}`}>Tech</button>
        <button onClick={() => setActiveTab('financial')} className={`card-tab-btn ${activeTab === 'financial' ? 'active' : ''}`}>Finance</button>
      </div>

      <div className="card-tab-content">
        {activeTab === 'general' && (
          <div className="card-details-grid">
            <div className="detail-item"><span className="detail-label">Location:</span><span className="detail-value">{visit.locationCity}</span></div>
            <div className="detail-item"><span className="detail-label">Person:</span><span className="detail-value">{visit.contactPersonName} ({visit.designation})</span></div>
            <div className="detail-item"><span className="detail-label">Phone:</span><span className="detail-value">{visit.contactNo}</span></div>
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}><span className="detail-label">Email:</span><span className="detail-value" style={{ wordBreak: 'break-all' }}>{visit.emailId || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">Strength:</span><span className="detail-value">{visit.schoolStrenght || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">Boards:</span><span className="detail-value">{visit.boards || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">D-Maker:</span><span className="detail-value">{visit.decisionMakerName || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">Timeline:</span><span className="detail-value">{visit.decisionTimeline || 'N/A'}</span></div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="card-details-grid">
            <div className="detail-item"><span className="detail-label">Platform:</span><span className="detail-value">{visit.requiredplatform || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">Current:</span><span className="detail-value">{visit.currentSystem || 'None'}</span></div>
            <div className="detail-item"><span className="detail-label">Users:</span><span className="detail-value">{visit.noOfUsers || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">Migration:</span><span className="detail-value">{visit.dataMigrationRequired || 'No'}</span></div>
            <div className="detail-item"><span className="detail-label">ID Cards:</span><span className="detail-value">{visit.idCards || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">RFID:</span><span className="detail-value">{visit.rfidIntegration || 'N/A'}</span></div>
            {visit.customFeatureDescription && (
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-label">Custom Features:</span>
                <span className="detail-value scrollable-item">{visit.customFeatureDescription}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="card-details-grid">
            <div className="detail-item"><span className="detail-label">Budget:</span><span className="detail-value">{visit.budgetRange || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">Cost/Mem:</span><span className="detail-value">{visit.costPerMember || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">Billing:</span><span className="detail-value">{visit.billingFrequency || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">PG Pref:</span><span className="detail-value">{visit.paymentGatewayPreference || 'N/A'}</span></div>
            {visit.initialPayment && (
              <div className="detail-item"><span className="detail-label">Init Pay:</span><span className="detail-value">₹{visit.initialPayment}</span></div>
            )}
            <div className="detail-item"><span className="detail-label">Demo:</span><span className="detail-value">{visit.demoDate ? `Scheduled: ${visit.demoDate}` : (visit.demoRequired || 'No')}</span></div>
            <div className="detail-item"><span className="detail-label">Proposal:</span><span className="detail-value">{visit.proposalDate ? `Sent: ${visit.proposalDate}` : (visit.proposalSent || 'No')}</span></div>
            <div className="detail-item"><span className="detail-label">Go-Live:</span><span className="detail-value">{visit.expectedGoLiveDate || 'TBD'}</span></div>
            {visit.paymentTerms && (
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-label">Payment Terms:</span>
                <span className="detail-value scrollable-item">{visit.paymentTerms}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="always-visible-modules">
        <span className="detail-label">Selected Modules:</span>
        <div className="module-tags" style={{ marginTop: '6px' }}>
          {visit.selectedModules?.length > 0 ? (
            visit.selectedModules.map(module => {
              const mod = modules.find(m => m.id === module.moduleId);
              return mod ? <span key={module.moduleId} className="module-tag">{mod.moduleName}</span> : null;
            })
          ) : (
            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No modules selected</span>
          )}
        </div>
      </div>

      {visit.status === 'REJECTED' && visit.rejectionReason && (
        <div className="rejection-box">
          <strong style={{ color: '#c53030', fontSize: '11px', textTransform: 'uppercase' }}>Reason:</strong>
          <p className="rejection-text">{visit.rejectionReason}</p>
        </div>
      )}

      <div className="card-actions">
        <button onClick={() => onEdit(visit)} className="btn-action btn-edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        {visit.status === 'PENDING' && (
          <>
            <button onClick={() => onStatusChange(visit.id, 'ACCEPTED')} className="btn-action btn-accept">Accept</button>
            <button onClick={() => onStatusChange(visit.id, 'REJECTED')} className="btn-action btn-reject">Reject</button>
          </>
        )}
      </div>
    </div>
  );
};

export default SchoolVisits;