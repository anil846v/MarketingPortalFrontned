import { useState, useEffect, useCallback, memo } from 'react';
import { showToast } from '../components/ToastContainer';
import { confirmAction } from '../components/ConfirmationProvider';
import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Memoized EditableField component to prevent unnecessary re-renders
const EditableField = memo(({ label, value, field, type = 'text', isEditMode, editData, onFieldChange, isNonEditable }) => (
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
    {isNonEditable ? (
      <div style={{
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        wordBreak: 'break-word'
      }}>
        {value || 'N/A'}
      </div>
    ) : isEditMode ? (
      <input
        type={type}
        value={editData[field] || ''}
        onChange={(e) => onFieldChange(field, e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'inherit',
          background: '#fff',
          color: '#000'
        }}
      />
    ) : (
      <div style={{
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        wordBreak: 'break-word'
      }}>
        {value || 'N/A'}
      </div>
    )}
  </div>
));

EditableField.displayName = 'EditableField';

const ModalTabs = ({ selectedVisit, getModuleDetails, onSave, isSaving, isEditMode, setIsEditMode, modules }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [editData, setEditData] = useState({
    ...selectedVisit,
    selectedModules: selectedVisit?.selectedModules || []
  });

  // Sync editData when selectedVisit changes
  useEffect(() => {
    if (selectedVisit) {
      setEditData({
        ...selectedVisit,
        selectedModules: selectedVisit?.selectedModules || []
      });
    }
  }, [selectedVisit?.id]); // Only update when the visit ID changes

  // Memoized callback to prevent unnecessary re-renders of EditableField
  const handleFieldChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

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

  // Removed EditableField definition - now using memoized component above

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
            <EditableField label="Visit ID" value={selectedVisit.id} field="id" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={true} />
            <EditableField label="School Name" value={editData.schoolName} field="schoolName" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Visit Date" value={editData.visitedDate} field="visitedDate" type="date" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Marketing Executive" value={editData.marketingExecutiveName} field="marketingExecutiveName" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Location City" value={editData.locationCity} field="locationCity" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
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
                Status
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#000',
                wordBreak: 'break-word'
              }}>
                {selectedVisit.status}
              </div>
            </div>
            <EditableField label="Created At" value={selectedVisit.createdAt} field="createdAt" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={true} />
            {isEditMode && selectedVisit.status === 'REJECTED' && (
              <EditableField label="Rejection Reason" value={editData.rejectionReason} field="rejectionReason" type="text" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            )}
            {!isEditMode && selectedVisit.status === 'REJECTED' && selectedVisit.rejectionReason && (
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
            <EditableField label="Contact Person" value={editData.contactPersonName} field="contactPersonName" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Designation" value={editData.designation} field="designation" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Contact No" value={editData.contactNo} field="contactNo" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Email ID" value={editData.emailId} field="emailId" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="School Strength" value={editData.schoolStrenght} field="schoolStrenght" type="number" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Current System" value={editData.currentSystem} field="currentSystem" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Platform Required" value={editData.requiredplatform} field="requiredplatform" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Billing Frequency" value={editData.billingFrequency} field="billingFrequency" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />

            <EditableField label="No Of Users" value={editData.noOfUsers} field="noOfUsers" type="number" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Decision Maker Name" value={editData.decisionMakerName} field="decisionMakerName" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Decision Timeline" value={editData.decisionTimeline} field="decisionTimeline" type="number" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
          </div>
        )}

        {activeTab === 'order' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <EditableField label="Expected Go Live Date" value={editData.expectedGoLiveDate} field="expectedGoLiveDate" type="date" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Order Booking Date" value={editData.orderBookingDate} field="orderBookingDate" type="date" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Initial Payment" value={editData.initialPayment} field="initialPayment" type="number" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Payment Terms" value={editData.paymentTerms} field="paymentTerms" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Cost Per Member" value={editData.costPerMember} field="costPerMember" type="number" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Budget Range" value={editData.budgetRange} field="budgetRange" type="number" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Payment Gateway Preference" value={editData.paymentGatewayPreference} field="paymentGatewayPreference" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Demo Required" value={editData.demoRequired} field="demoRequired" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Demo Date" value={editData.demoDate} field="demoDate" type="date" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Proposal Sent" value={editData.proposalSent} field="proposalSent" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Proposal Date" value={editData.proposalDate} field="proposalDate" type="date" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
          </div>
        )}

        {activeTab === 'requirements' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <EditableField label="Data Migration Required" value={editData.dataMigrationRequired} field="dataMigrationRequired" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Custom Features Required" value={editData.customFeaturesRequired} field="customFeaturesRequired" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="Custom Features Description" value={editData.customFeatureDescription} field="customFeatureDescription" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="RFID Integration" value={editData.rfidIntegration} field="rfidIntegration" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
            <EditableField label="ID Cards" value={editData.idCards} field="idCards" isEditMode={isEditMode} editData={editData} onFieldChange={handleFieldChange} isNonEditable={false} />
          </div>
        )}

        {activeTab === 'modules' && (
          <div>
            {isEditMode ? (
              // Edit mode - show all modules with toggles
              <div>
                <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#333', fontSize: '16px', fontWeight: '600' }}>Select Modules</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {modules.map((module) => {
                    const isSelected = editData.selectedModules?.some(m => m.moduleId === module.id);
                    const selectedModule = editData.selectedModules?.find(m => m.moduleId === module.id);

                    return (
                      <div key={module.id} style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e5e5',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#000',
                              marginBottom: '4px'
                            }}>
                              {module.moduleName}
                            </div>
                            <div style={{
                              fontSize: '13px',
                              color: '#666',
                              lineHeight: '1.4'
                            }}>
                              {module.description}
                            </div>
                          </div>
                          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '8px', flexShrink: 0 }}>
                            <div style={{ position: 'relative', width: '44px', height: '24px', background: isSelected ? '#4CAF50' : '#ccc', borderRadius: '12px', transition: 'background 0.3s' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditData({
                                      ...editData,
                                      selectedModules: [...(editData.selectedModules || []), { moduleId: module.id, isSelected: 'Yes', remarks: '' }]
                                    });
                                  } else {
                                    setEditData({
                                      ...editData,
                                      selectedModules: (editData.selectedModules || []).filter(m => m.moduleId !== module.id)
                                    });
                                  }
                                }}
                                style={{ display: 'none' }}
                              />
                              <div style={{ position: 'absolute', top: '2px', left: isSelected ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: isSelected ? '#4CAF50' : '#999' }}>{isSelected ? 'Selected' : 'Not Selected'}</span>
                          </label>
                        </div>
                        {isSelected && (
                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333', fontSize: '13px' }}>Remarks (Optional)</label>
                            <textarea
                              value={selectedModule.remarks || ''}
                              onChange={(e) => {
                                setEditData({
                                  ...editData,
                                  selectedModules: editData.selectedModules.map(m =>
                                    m.moduleId === module.id ? { ...m, remarks: e.target.value } : m
                                  )
                                });
                              }}
                              placeholder="Add any remarks about this module..."
                              style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                background: '#fff',
                                color: '#333'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // View mode - show selected modules
              <>
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
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e5e5', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isEditMode && onSave && (
            <button
              onClick={() => setIsEditMode(true)}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          )}
          {isEditMode && onSave && (
            <>
              <button
                onClick={() => onSave(editData)}
                disabled={isSaving}
                style={{
                  padding: '10px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  opacity: isSaving ? 0.7 : 1,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => !isSaving && (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => !isSaving && (e.currentTarget.style.opacity = '1')}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setEditData(selectedVisit);
                }}
                disabled={isSaving}
                style={{
                  padding: '10px 16px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const VisitsSection = () => {
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [modules, setModules] = useState([]);
  const [hoveredVisitId, setHoveredVisitId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptingVisitId, setAcceptingVisitId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingVisitId, setRejectingVisitId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [acceptForm, setAcceptForm] = useState({ initialPayment: '', paymentTerms: '', costPerMember: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [downloadType, setDownloadType] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');

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

  const getModuleName = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.moduleName : `Module ${moduleId}`;
  };

  const downloadVisitsPDF = (visitsToDownload, type = 'all') => {
    if (visitsToDownload.length === 0) return;
    const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
    let currentY = 15;

    // ========== COVER PAGE ==========
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('SCHOOL VISITS', 14, currentY);
    currentY += 15;

    doc.setFontSize(18);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    const coverTitle = type === 'all' ? 'Comprehensive Report' : `Details: ${visitsToDownload[0].schoolName}`;
    doc.text(coverTitle, 14, currentY);
    currentY += 20;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('Report Information', 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, currentY);
    currentY += 6;
    doc.text(`Total Visits: ${visitsToDownload.length}`, 14, currentY);
    currentY += 6;
    doc.text(`Report Type: ${type === 'all' ? 'All Visits' : 'Individual Visit'}`, 14, currentY);
    currentY += 20;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('Summary Metrics', 14, currentY);
    currentY += 8;

    const summaryData = [
      ['Total Visits', visitsToDownload.length.toString()],
      ['Pending', visitsToDownload.filter(v => v.status === 'PENDING').length.toString()],
      ['Accepted', visitsToDownload.filter(v => v.status === 'ACCEPTED').length.toString()],
      ['Rejected', visitsToDownload.filter(v => v.status === 'REJECTED').length.toString()]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6, overflow: 'hidden' },
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
      bodyStyles: { textColor: [50, 50, 50], valign: 'middle' },
      columnStyles: { 0: { cellWidth: 75, halign: 'left' }, 1: { cellWidth: 65, halign: 'left', fontStyle: 'bold' } },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('Visits Overview', 14, currentY);
    currentY += 8;

    const tableHead = [['#', 'School Name', 'Visit Date', 'Contact', 'Marketing Exec', 'Location', 'Status']];
    const tableBody = visitsToDownload.map((visit, index) => [
      (index + 1).toString(),
      visit.schoolName || 'N/A',
      visit.visitedDate || 'N/A',
      visit.contactPersonName || 'N/A',
      visit.marketingExecutiveName || 'N/A',
      visit.locationCity || 'N/A',
      visit.status || 'N/A'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5, halign: 'left', overflow: 'hidden', valign: 'middle' },
      headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      alternateRowStyles: { fillColor: [245, 248, 250] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 45, halign: 'left' },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 28, halign: 'left' },
        4: { cellWidth: 28, halign: 'left' },
        5: { cellWidth: 28, halign: 'left' },
        6: { cellWidth: 28, halign: 'center' }
      }
    });

    // ========== DETAILED PAGES FOR EACH VISIT ==========
    visitsToDownload.forEach((visit, visitIndex) => {
      doc.addPage('a4', 'portrait');
      let pageY = 15;

      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(44, 62, 80);
      doc.text(`VISIT #${visitIndex + 1}`, 14, pageY);
      pageY += 8;

      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(70, 90, 110);
      doc.text(visit.schoolName || 'N/A', 14, pageY);
      pageY += 10;

      doc.setDrawColor(52, 152, 219);
      doc.setLineWidth(0.5);
      doc.line(14, pageY, 196, pageY);
      pageY += 8;

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Visit ID: ${visit.id || 'N/A'} | Created: ${visit.createdAt || 'N/A'} | Status: ${visit.status || 'N/A'}`, 14, pageY);
      pageY += 8;

      const sections = [
        { title: 'BASIC INFORMATION', data: [['School Name', visit.schoolName || 'N/A'], ['Visit Date', visit.visitedDate || 'N/A'], ['Location City', visit.locationCity || 'N/A'], ['Marketing Executive', visit.marketingExecutiveName || 'N/A'], ['Status', visit.status || 'N/A']] },
        { title: 'CONTACT INFORMATION', data: [['Contact Person', visit.contactPersonName || 'N/A'], ['Designation', visit.designation || 'N/A'], ['Contact No', visit.contactNo || 'N/A'], ['Email ID', visit.emailId || 'N/A'], ['School Strength', visit.schoolStrenght || 'N/A'], ['No of Users', visit.noOfUsers || 'N/A'], ['Current System', visit.currentSystem || 'N/A'], ['RequiredPlatform', visit.requiredplatform || 'N/A'], ['Billing Frequency', visit.billingFrequency]] },
        { title: 'ORDER DETAILS', data: [['Order Booking Date', visit.orderBookingDate || 'N/A'], ['Expected Go Live Date', visit.expectedGoLiveDate || 'N/A'], ['Initial Payment', `₹${parseFloat(visit.initialPayment || 0).toLocaleString()}`], ['Budget Range', `₹${parseFloat(visit.budgetRange || 0).toLocaleString()}`], ['Payment Terms', visit.paymentTerms || 'N/A'], ['Cost Per Member', `₹${parseFloat(visit.costPerMember || 0).toLocaleString()}`], ['Payment Gateway Preference', visit.paymentGatewayPreference || 'N/A']] },
        { title: 'REQUIREMENTS', data: [['Data Migration Required', visit.dataMigrationRequired || 'N/A'], ['Custom Features Required', visit.customFeaturesRequired || 'N/A'], ['RFID Integration', visit.rfidIntegration || 'N/A'], ['ID Cards', visit.idCards || 'N/A']] },
        { title: 'SALES PIPELINE', data: [['Decision Maker Name', visit.decisionMakerName || 'N/A'], ['Decision Timeline (Days)', visit.decisionTimeline || 'N/A'], ['Demo Required', visit.demoRequired || 'N/A'], ['Demo Date', visit.demoDate || 'N/A'], ['Proposal Sent', visit.proposalSent || 'N/A'], ['Proposal Date', visit.proposalDate || 'N/A']] }
      ];

      sections.forEach((section) => {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        doc.text(section.title, 14, pageY);
        pageY += 6;

        autoTable(doc, {
          startY: pageY,
          body: section.data,
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 5, overflow: 'hidden', valign: 'top' },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold', fillColor: [236, 240, 241], textColor: [44, 62, 80], halign: 'left' },
            1: { cellWidth: 115, textColor: [50, 50, 50], halign: 'left' }
          },
          margin: { left: 14, right: 14 }
        });
        pageY = doc.lastAutoTable.finalY + 8;
      });

      if (visit.selectedModules && visit.selectedModules.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        doc.text('SELECTED MODULES', 14, pageY);
        pageY += 6;

        const modulesData = visit.selectedModules.map((mod, idx) => [
          (idx + 1).toString(),
          getModuleName(mod.moduleId),
          mod.isSelected || 'N/A',
          mod.remarks || 'N/A'
        ]);

        autoTable(doc, {
          startY: pageY,
          head: [['#', 'Module Name', 'Selected', 'Remarks']],
          body: modulesData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 4 },
          headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 60 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 65 }
          },
          margin: { left: 14, right: 14 }
        });
      }
    });

    const filename = type === 'all' ? `School_Visits_Report_${new Date().toISOString().split('T')[0]}.pdf` : `Visit_${visitsToDownload[0].schoolName}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const downloadVisitsExcel = (visitsToDownload, type = 'all') => {
    if (visitsToDownload.length === 0) return;
    const summarySheet = [['SCHOOL VISITS - SUMMARY REPORT'], ['Generated on:', new Date().toLocaleDateString()], ['Total Visits:', visitsToDownload.length], ['Pending:', visitsToDownload.filter(v => v.status === 'PENDING').length], ['Accepted:', visitsToDownload.filter(v => v.status === 'ACCEPTED').length], ['Rejected:', visitsToDownload.filter(v => v.status === 'REJECTED').length], []];
    const overviewData = [['#', 'School Name', 'Visit Date', 'Contact Person', 'Designation', 'Contact No', 'Email', 'Marketing Exec', 'Location', 'School Strength', 'No of Users', 'Current System', 'Platform Required', 'Billing Frequency ', 'Decision Maker', 'Decision Timeline', 'Order Date', 'Go Live Date', 'Initial Payment', 'Budget Range', 'Payment Terms', 'Cost Per Member', 'Demo Required', 'Demo Date', 'Proposal Sent', 'Proposal Date', 'Data Migration', 'Custom Features', 'RFID Integration', 'ID Cards', 'Payment Gateway', 'Status']];
    visitsToDownload.forEach((visit, idx) => { overviewData.push([idx + 1, visit.schoolName || 'N/A', visit.visitedDate || 'N/A', visit.contactPersonName || 'N/A', visit.designation || 'N/A', visit.contactNo || 'N/A', visit.emailId || 'N/A', visit.marketingExecutiveName || 'N/A', visit.locationCity || 'N/A', visit.schoolStrenght || 'N/A', visit.noOfUsers || 'N/A', visit.currentSystem || 'N/A', visit.requiredplatform || 'N/A', visit.billingFrequency || 'N/A', visit.decisionMakerName || 'N/A', visit.decisionTimeline || 'N/A', visit.orderBookingDate || 'N/A', visit.expectedGoLiveDate || 'N/A', parseFloat(visit.initialPayment || 0), parseFloat(visit.budgetRange || 0), visit.paymentTerms || 'N/A', parseFloat(visit.costPerMember || 0), visit.demoRequired || 'N/A', visit.demoDate || 'N/A', visit.proposalSent || 'N/A', visit.proposalDate || 'N/A', visit.dataMigrationRequired || 'N/A', visit.customFeaturesRequired || 'N/A', visit.rfidIntegration || 'N/A', visit.idCards || 'N/A', visit.paymentGatewayPreference || 'N/A', visit.status || 'N/A']); });
    const modulesData = [['School Name', 'Module Name', 'Selected', 'Remarks']];
    visitsToDownload.forEach((visit) => { if (visit.selectedModules && visit.selectedModules.length > 0) { visit.selectedModules.forEach((mod) => { modulesData.push([visit.schoolName, getModuleName(mod.moduleId), mod.isSelected || 'N/A', mod.remarks || 'N/A']); }); } });
    const wb = XLSX.utils.book_new();
    wb.Sheets['Summary'] = XLSX.utils.aoa_to_sheet(summarySheet);
    wb.Sheets['Overview'] = XLSX.utils.aoa_to_sheet(overviewData);
    wb.Sheets['Modules'] = XLSX.utils.aoa_to_sheet(modulesData);
    wb.SheetNames.push('Summary', 'Overview', 'Modules');
    const sheets = ['Summary', 'Overview', 'Modules'];
    sheets.forEach(sheet => { if (wb.Sheets[sheet]) { const ws = wb.Sheets[sheet]; for (let key in ws) { if (key.startsWith('!')) continue; if (ws[key].v) ws[key].s = { alignment: { wrapText: true } }; } ws['!cols'] = Array(30).fill({ wch: 18 }); } });
    const filename = type === 'all' ? `School_Visits_Report_${new Date().toISOString().split('T')[0]}.xlsx` : `Visit_${visitsToDownload[0].schoolName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const handleDownloadVisits = () => {
    let visitsToDownload = visits;
    if (downloadType === 'individual' && selectedSchool) {
      visitsToDownload = visits.filter(v => v.schoolName === selectedSchool);
    }
    if (visitsToDownload.length === 0) {
      alert('No visits to download');
      return;
    }
    if (exportFormat === 'pdf') {
      downloadVisitsPDF(visitsToDownload, downloadType);
    } else {
      downloadVisitsExcel(visitsToDownload, downloadType);
    }
  };

  const handleChangeStatus = async (visitId, newStatus) => {
    // Don't allow changing from same status
    const currentVisit = visits.find(v => v.id === visitId);
    if (currentVisit && currentVisit.status === newStatus) {
      return;
    }

    // Set selectedVisit to open modal
    setSelectedVisit(currentVisit);
    setIsEditMode(false);

    if (newStatus === 'ACCEPTED') {
      setAcceptingVisitId(visitId);
      setShowAcceptModal(true);
      setShowRejectModal(false);
      setRejectingVisitId(null);
      setRejectionReason('');
      return;
    }
    if (newStatus === 'REJECTED') {
      setRejectingVisitId(visitId);
      setShowRejectModal(true);
      setShowAcceptModal(false);
      setAcceptingVisitId(null);
      setAcceptForm({ initialPayment: '', paymentTerms: '', costPerMember: '' });
      return;
    }
    if (newStatus === 'PENDING') {
      // When changing to PENDING, close all modals and directly update
      setShowAcceptModal(false);
      setShowRejectModal(false);
      setAcceptingVisitId(null);
      setRejectingVisitId(null);
      setAcceptForm({ initialPayment: '', paymentTerms: '', costPerMember: '' });
      setRejectionReason('');
      // Update to PENDING directly
      try {
        const response = await fetch(`${API_BASE_URL}/admin/schoolVisits/${visitId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'PENDING' })
        });
        if (response.ok) {
          showToast('Status changed to PENDING', 'success');
          fetchVisits();
          setSelectedVisit(null);
        } else {
          showToast('Failed to update status', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('Failed to update status', 'error');
      }
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
      const response = await fetch(`${API_BASE_URL}/admin/schoolVisits/${rejectingVisitId}`, {
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
        setIsEditMode(false);
        fetchVisits();
        setSelectedVisit(null);
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
      const response = await fetch(`${API_BASE_URL}/admin/schoolVisits/${acceptingVisitId}`, {
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
        setIsEditMode(false);
        fetchVisits();
        setSelectedVisit(null);
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

  const handleSaveVisit = async (updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/schoolVisits/${selectedVisit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      if (response.ok) {
        showToast('School visit updated successfully', 'success');
        setIsEditMode(false);
        fetchVisits();
        setSelectedVisit(null);
      } else {
        showToast('Error: ' + (data.error || 'Failed to update visit'), 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to update visit: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }; const handleDeleteVisit = async (visitId) => {
    const confirmed = await confirmAction(
      'Delete School Visit',
      'Are you sure you want to delete this school visit? This action cannot be undone.',
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
        showToast('School visit deleted successfully', 'success');
        fetchVisits();
        setSelectedVisit(null);
        setIsEditMode(false);
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
        {/* Accept Modal */}
        {showAcceptModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Accept Order</h3>
              <form onSubmit={handleAcceptOrder}>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <input type="number" placeholder="Initial Payment" value={acceptForm.initialPayment} onChange={(e) => setAcceptForm({ ...acceptForm, initialPayment: e.target.value })} style={{ backgroundColor: '#fafafa', color: 'black', padding: '12px', border: '2px solid #1538ab', borderRadius: '6px', fontSize: '14px' }} />
                  <textarea placeholder="Payment Terms" value={acceptForm.paymentTerms} onChange={(e) => setAcceptForm({ ...acceptForm, paymentTerms: e.target.value })} style={{ backgroundColor: '#fafafa', color: 'black', padding: '12px', border: '2px solid #1538ab', borderRadius: '6px', fontSize: '14px', minHeight: '80px', resize: 'vertical' }} />
                  <input type="number" placeholder="Cost Per Member" value={acceptForm.costPerMember} onChange={(e) => setAcceptForm({ ...acceptForm, costPerMember: e.target.value })} style={{ backgroundColor: '#fafafa', color: 'black', padding: '12px', border: '2px solid #1538ab', borderRadius: '6px', fontSize: '14px' }} />
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

        {/* Reject Modal */}
        {showRejectModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#dc3545' }}>Reject Visit</h3>
              <form onSubmit={handleRejectVisit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Rejection Reason *</label>
                  <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Please provide a reason for rejecting this visit..." required style={{ backgroundColor: '#fafafa', color: 'black', width: '100%', minHeight: '100px', padding: '12px', border: '2px solid #9c0606', borderRadius: '6px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
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

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f0f0f0' }}>
            <button onClick={() => { setIsEditMode(false); setSelectedVisit(null); }} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to Visits
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Visit Details
            </h2>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedVisit.status}
                onChange={(e) => handleChangeStatus(selectedVisit.id, e.target.value)}
                className="status-select"
                style={{
                  padding: '8px 32px 8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor:
                    selectedVisit.status === 'PENDING' ? '#fff3cd' :
                      selectedVisit.status === 'ACCEPTED' ? '#d1f2eb' :
                        '#f8d7da',
                  color:
                    selectedVisit.status === 'PENDING' ? '#856404' :
                      selectedVisit.status === 'ACCEPTED' ? '#0f5132' :
                        '#842029'
                }}
              >
                <option value="PENDING">PENDING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>
          <ModalTabs selectedVisit={selectedVisit} getModuleDetails={getModuleDetails} onSave={handleSaveVisit} isSaving={loading} isEditMode={isEditMode} setIsEditMode={setIsEditMode} modules={modules} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>All School Visits ({visits.length})</h2>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {/* Export Controls */}
        <div style={{ padding: '20px', borderBottom: '2px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', background: '#fafbfc', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44546f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Export Type</label>
            <select
              value={downloadType}
              onChange={(e) => {
                setDownloadType(e.target.value);
                setSelectedSchool('');
              }}
              style={{ width: '100%', padding: '10px 32px 10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: '500' }}
            >
              <option value="all">All Visits</option>
              <option value="individual">Specific School</option>
            </select>
          </div>

          {downloadType === 'individual' && (
            <div style={{ flex: 1, minWidth: '300px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44546f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Select School</label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                style={{ width: '100%', padding: '10px 32px 10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: '500' }}
              >
                <option value="">Choose a school...</option>
                {[...new Set(visits.map(v => v.schoolName))].map((school, idx) => (
                  <option key={idx} value={school}>{school}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ flex: 1, minWidth: '300px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44546f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>File Format</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setExportFormat('pdf')}
                style={{ flex: 1, padding: '10px 16px', background: exportFormat === 'pdf' ? 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' : '#ecf0f1', color: exportFormat === 'pdf' ? 'white' : '#2c3e50', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                PDF
              </button>
              <button
                onClick={() => setExportFormat('excel')}
                style={{ flex: 1, padding: '10px 16px', background: exportFormat === 'excel' ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)' : '#ecf0f1', color: exportFormat === 'excel' ? 'white' : '#27ae60', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Excel
              </button>
            </div>
          </div>

          <button
            onClick={handleDownloadVisits}
            disabled={visits.length === 0 || (downloadType === 'individual' && !selectedSchool)}
            style={{ padding: '12px 28px', background: (visits.length === 0 || (downloadType === 'individual' && !selectedSchool)) ? '#bdc3c7' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: (visits.length === 0 || (downloadType === 'individual' && !selectedSchool)) ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)')}
            onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download {exportFormat.toUpperCase()}
          </button>
        </div>

        <div className="table-container">
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e5e5e5' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>School Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Visited Date</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Marketing Executive</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Location</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit, index) => (
                <tr
                  key={visit.id}
                  style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    setHoveredVisitId(visit.id);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    setHoveredVisitId(null);
                  }}
                >
                  <td data-label="Id" style={{ padding: '16px', fontSize: '14px', color: '#333' }}>{index + 1}</td>
                  <td data-label="SchoolName" style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#000' }}>{visit.schoolName}</td>
                  <td data-label="VisitedDate" style={{ padding: '16px', fontSize: '14px', color: '#333' }}>{visit.visitedDate}</td>
                  <td data-label="ExecutiveName" style={{ padding: '16px', fontSize: '14px', color: '#333' }}>{visit.marketingExecutiveName}</td>
                  <td data-label="LocationCity" style={{ padding: '16px', fontSize: '14px', color: '#333' }}>{visit.locationCity}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#333' }}>
                    <select data-label="Status"
                      value={visit.status}
                      onChange={(e) => handleChangeStatus(visit.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px', minWidth: '140px', whiteSpace: 'nowrap' }}>
                    <button onClick={() => { setSelectedVisit(visit); setIsEditMode(false); }} style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '0 4px 0 0' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                      View
                    </button>
                    <button onClick={() => { setSelectedVisit(visit); setIsEditMode(true); }} style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '0 4px 0 0' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteVisit(visit.id)} style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisitsSection;
export { ModalTabs };
