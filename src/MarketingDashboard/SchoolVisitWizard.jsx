import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import './SchoolVisitWizard.css';

const SchoolVisitWizard = ({ modules, onSubmit, onCancel, editingVisit, loading }) => {
    const [showCustomFeatureModal, setShowCustomFeatureModal] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [customFeatureDescription, setCustomFeatureDescription] = useState('');
    const [selectedModule, setSelectedModule] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        schoolName: editingVisit?.schoolName || '',
        locationCity: editingVisit?.locationCity || '',
        contactPersonName: editingVisit?.contactPersonName || '',
        designation: editingVisit?.designation || '',
        contactNo: editingVisit?.contactNo || '',
        emailId: editingVisit?.emailId || '',
        schoolStrenght: editingVisit?.schoolStrenght || '',
        boards: editingVisit?.boards || '',
        costPerMember: editingVisit?.costPerMember || '',
        currentSystem: editingVisit?.currentSystem || '',
        requiredplatform: editingVisit?.requiredplatform || '',
        billingFrequency: editingVisit?.billingFrequency || '',
        noOfUsers: editingVisit?.noOfUsers || '',
        dataMigrationRequired: editingVisit?.dataMigrationRequired || '',
        customFeaturesRequired: editingVisit?.customFeaturesRequired || '',
        customFeatureDescription: editingVisit?.customFeatureDescription || '',

        rfidIntegration: editingVisit?.rfidIntegration || '',
        idCards: editingVisit?.idCards || '',
        paymentGatewayPreference: editingVisit?.paymentGatewayPreference || '',
        budgetRange: editingVisit?.budgetRange || '',
        expectedGoLiveDate: editingVisit?.expectedGoLiveDate || '',
        decisionMakerName: editingVisit?.decisionMakerName || '',
        decisionTimeline: editingVisit?.decisionTimeline || '',
        demoRequired: editingVisit?.demoRequired || '',
        demoDate: editingVisit?.demoDate || '',
        proposalSent: editingVisit?.proposalSent || '',
        proposalDate: editingVisit?.proposalDate || '',
        selectedModules: editingVisit?.selectedModules?.map(m => ({ moduleId: m.moduleId, remarks: m.remarks || '' })) || []
    });

    const steps = [
        { id: 'basic', label: 'Basic Info and Contact Details', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
        { id: 'technical', label: 'Technical Info', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
        { id: 'requirements', label: 'Requirements', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },
        { id: 'modules', label: 'Select Modules', icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>' }
    ];

    const validateStep = () => {
        if (currentStep === 0) {
            return (
                formData.schoolName &&
                formData.schoolStrenght &&
                formData.contactPersonName &&
                formData.designation &&
                formData.contactNo &&
                formData.emailId &&
                formData.decisionMakerName &&
                formData.decisionTimeline &&
                formData.locationCity
            );
        }
        if (currentStep === 1) {
            return (
                formData.boards &&
                formData.currentSystem &&
                formData.requiredplatform &&
                formData.billingFrequency &&
                formData.noOfUsers &&
                formData.costPerMember &&
                formData.budgetRange &&
                formData.paymentGatewayPreference &&
                formData.proposalSent &&
                formData.proposalDate &&
                formData.expectedGoLiveDate
            );
        }
        if (currentStep === 2) {
            const basic = (
                formData.dataMigrationRequired &&
                formData.customFeaturesRequired &&
                formData.idCards &&
                formData.demoRequired
            );
            if (!basic) return false;

            if (formData.customFeaturesRequired === 'YES' && !formData.customFeatureDescription) return false;
            if ((formData.idCards === 'Premium' || formData.idCards === 'Normal') && !formData.rfidIntegration) return false;
            if (formData.demoRequired === 'YES' && !formData.demoDate) return false;

            return true;
        }
        if (currentStep === 3) {
            return formData.selectedModules.length > 0;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setShowErrors(false);
            if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
        } else {
            setShowErrors(true);
        }
    };

    const handlePrevious = () => {
        setShowErrors(false);
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Do nothing - form submission is handled by buttons only
    };

    const handleFormSubmit = () => {
        if (validateStep()) {
            onSubmit(formData);
        } else {
            setShowErrors(true);
        }
    };

    const updateField = (field, value) => setFormData({ ...formData, [field]: value });


    const PRICING = {
        S500: {
            Web: { Quarterly: 18, Yearly: 15 },
            "Web+App": { Quarterly: 22, Yearly: 18 }
        },
        S1000: {
            Web: { Quarterly: 15, Yearly: 12 },
            "Web+App": { Quarterly: 20, Yearly: 15 }
        }
    };

    const getSlab = (strength) => strength < 1000 ? "S500" : "S1000";

    const getMonths = (billing) => {
        switch (billing) {
            case "Monthly": return 1;
            case "Quarterly": return 3;
            case "HalfYearly": return 6;
            case "Yearly": return 12;
            default: return 1;
        }
    };

    const getRateType = (billing) => {
        return billing === "Yearly" ? "Yearly" : "Quarterly";
    };

    const calculatePricing = (data) => {
        const strength = Number(data.schoolStrenght);
        const platform = data.requiredplatform;
        const billing = data.billingFrequency;

        if (!strength || !platform || !billing) return null;

        const slab = getSlab(strength);
        const pricing = PRICING[slab]?.[platform];
        if (!pricing) return null;

        const rateType = getRateType(billing); // 🔥 key rule
        const monthlyRate = pricing[rateType];

        const months = getMonths(billing);

        const finalTotal = monthlyRate * months * strength;

        return {
            monthlyRate,
            months,
            finalTotal
        };
    };

    useEffect(() => {
        const result = calculatePricing(formData);

        if (result && formData.budgetRange !== Math.round(result.finalTotal)) {
            setFormData(prev => ({
                ...prev,
                budgetRange: Math.round(result.finalTotal)
            }));
        }
    }, [
        formData.schoolStrenght,
        formData.requiredplatform,
        formData.billingFrequency
    ]);




    const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: '#fff', color: '#000', transition: 'border-color 0.2s' };

    const getInputStyle = (field, isSelect = false) => {
        const value = formData[field];
        const isInvalid = showErrors && !value;
        return {
            ...inputStyle,
            borderColor: isInvalid ? '#ff4d4f' : '#ddd',
            outline: isInvalid ? 'none' : undefined,
            boxShadow: isInvalid ? '0 0 0 2px rgba(255, 77, 79, 0.1)' : 'none'
        };
    };

    return (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e5e5', marginBottom: '24px' }}>
            <div style={{ background: '#f8f9fa', padding: '20px 24px', borderBottom: '1px solid #e5e5e5' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600', color: '#000' }}>
                    {editingVisit ? 'Edit School Visit' : 'New School Visit'}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
                </p>
            </div>

            <div style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #e5e5e5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {steps.map((step, index) => (
                        <div key={step.id} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: index <= currentStep ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e5e5',
                                color: index <= currentStep ? '#fff' : '#999',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 6px', transition: 'all 0.3s'
                            }}>
                                {index < currentStep ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : index === currentStep ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {step.id === 'basic' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
                                        {step.id === 'technical' && <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>}
                                        {step.id === 'requirements' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>}
                                        {step.id === 'modules' && <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>}
                                    </svg>
                                ) : (
                                    <span style={{ fontSize: '16px', fontWeight: '600' }}>{index + 1}</span>
                                )}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: index === currentStep ? '600' : '500', color: index === currentStep ? '#667eea' : '#666' }}>
                                {step.label}
                            </div>
                            {index < steps.length - 1 && (
                                <div style={{
                                    position: 'absolute', top: '18px', left: 'calc(50% + 18px)',
                                    width: 'calc(100% - 36px)', height: '2px',
                                    background: index < currentStep ? '#667eea' : '#e5e5e5', transition: 'all 0.3s'
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}>
                    {currentStep === 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>School Name *</label><input type="text" value={formData.schoolName} onChange={(e) => updateField('schoolName', e.target.value)} disabled={editingVisit} required style={getInputStyle('schoolName')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>School Strength *</label><input type="number" value={formData.schoolStrenght} onChange={(e) => updateField('schoolStrenght', e.target.value)} required style={getInputStyle('schoolStrenght')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Contact Person *</label><input type="text" value={formData.contactPersonName} onChange={(e) => updateField('contactPersonName', e.target.value)} required style={getInputStyle('contactPersonName')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Designation *</label><input type="text" value={formData.designation} onChange={(e) => updateField('designation', e.target.value)} required style={getInputStyle('designation')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Contact Number *</label><input type="tel" value={formData.contactNo} onChange={(e) => updateField('contactNo', e.target.value)} required style={getInputStyle('contactNo')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Email ID *</label><input type="email" value={formData.emailId} onChange={(e) => updateField('emailId', e.target.value)} required style={getInputStyle('emailId')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Decision Maker Name *</label><input type="text" value={formData.decisionMakerName} onChange={(e) => updateField('decisionMakerName', e.target.value)} required style={getInputStyle('decisionMakerName')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Decision TimeLine *</label><input type="text" value={formData.decisionTimeline} onChange={(e) => updateField('decisionTimeline', e.target.value)} required style={getInputStyle('decisionTimeline')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Location City *</label><input type="text" value={formData.locationCity} onChange={(e) => updateField('locationCity', e.target.value)} disabled={editingVisit} required style={getInputStyle('locationCity')} /></div>

                        </div>
                    )}



                    {currentStep === 1 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Boards *</label><input type="text" value={formData.boards} onChange={(e) => updateField('boards', e.target.value)} required style={getInputStyle('boards')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Current System *</label><input type="text" value={formData.currentSystem} onChange={(e) => updateField('currentSystem', e.target.value)} required style={getInputStyle('currentSystem')} /></div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                    Platform Required *
                                </label>
                                <select
                                    value={formData.requiredplatform}
                                    onChange={(e) => updateField('requiredplatform', e.target.value)}
                                    required
                                    style={getInputStyle('requiredplatform')}
                                >
                                    <option value="">Select</option>
                                    <option value="Web">Web Only</option>
                                    <option value="Web+App">Web + App</option>
                                    <option value="None">None</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                    Billing Frequency *
                                </label>
                                <select
                                    value={formData.billingFrequency}
                                    onChange={(e) => updateField('billingFrequency', e.target.value)}
                                    required
                                    style={getInputStyle('billingFrequency')}
                                >
                                    <option value="">Select</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="HalfYearly">Half Yearly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Number of Users *</label><input type="number" value={formData.noOfUsers} onChange={(e) => updateField('noOfUsers', e.target.value)} required style={getInputStyle('noOfUsers')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Cost Per Member *</label><input type="number" value={formData.costPerMember} onChange={(e) => updateField('costPerMember', e.target.value)} required style={getInputStyle('costPerMember')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Budget Range *</label><input type="number" value={formData.budgetRange} onChange={(e) => updateField('budgetRange', e.target.value)} required style={getInputStyle('budgetRange')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Payment Gateway Preference *</label><input type="text" value={formData.paymentGatewayPreference} onChange={(e) => updateField('paymentGatewayPreference', e.target.value)} required style={getInputStyle('paymentGatewayPreference')} /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Proposal Sent *</label><select value={formData.proposalSent} onChange={(e) => updateField('proposalSent', e.target.value)} required style={getInputStyle('proposalSent')}><option value="">Select</option><option value="YES">Yes</option><option value="NO">No</option></select></div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Proposal Date *</label>
                                <div className="date-input-wrapper" style={{ borderColor: showErrors && !formData.proposalDate ? '#ff4d4f' : '#ddd', borderWidth: '1px', borderStyle: 'solid', borderRadius: '6px' }}>
                                    <input
                                        type="date"
                                        value={formData.proposalDate || ''}
                                        onChange={(e) => updateField('proposalDate', e.target.value)}
                                        required
                                        className="wizard-input"
                                        style={{ border: 'none', width: '100%' }}
                                    />
                                    <Calendar className="calendar-icon-svg" size={18} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Expected Go-Live Date *</label>
                                <div className="date-input-wrapper" style={{ borderColor: showErrors && !formData.expectedGoLiveDate ? '#ff4d4f' : '#ddd', borderWidth: '1px', borderStyle: 'solid', borderRadius: '6px' }}>
                                    <input
                                        type="date"
                                        value={formData.expectedGoLiveDate || ''}
                                        onChange={(e) => updateField('expectedGoLiveDate', e.target.value)}
                                        required
                                        className="wizard-input"
                                        style={{ border: 'none', width: '100%' }}
                                    />
                                    <Calendar className="calendar-icon-svg" size={18} />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Data Migration Required *</label><select value={formData.dataMigrationRequired} onChange={(e) => updateField('dataMigrationRequired', e.target.value)} required style={getInputStyle('dataMigrationRequired')}><option value="">Select</option><option value="YES">Yes</option><option value="NO">No</option></select></div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Custom Features Required *</label>
                                <select
                                    required
                                    value={formData.customFeaturesRequired}
                                    onChange={(e) => {
                                        updateField('customFeaturesRequired', e.target.value);

                                        if (e.target.value === 'YES') {
                                            setCustomFeatureDescription(formData.customFeatureDescription || '');
                                            setShowCustomFeatureModal(true);
                                        }

                                        if (e.target.value === 'NO') {
                                            updateField('customFeatureDescription', '');
                                        }
                                    }}
                                    style={getInputStyle('customFeaturesRequired')}
                                >
                                    <option value="">Select</option>
                                    <option value="YES">Yes</option>
                                    <option value="NO">No</option>
                                </select>
                            </div>
                            {/* <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>RFID Integration</label><select value={formData.rfidIntegration} onChange={(e) => updateField('rfidIntegration', e.target.value)} style={inputStyle}><option value="">Select</option><option value="YES">Yes</option><option value="NO">No</option></select></div>
              <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>ID Cards</label><select value={formData.idCards} onChange={(e) => updateField('idCards', e.target.value)} style={inputStyle}><option value="">Select</option><option value="Premium">Premium</option><option value="Normal">Normal</option>
              <option value="NO">No</option></select></div> */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                    ID Cards *
                                </label>

                                <select
                                    value={formData.idCards}
                                    required
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        setFormData(prev => ({
                                            ...prev,
                                            idCards: value,
                                            rfidIntegration: '' // ALWAYS reset when ID Cards changes
                                        }));
                                    }}
                                    style={getInputStyle('idCards')}
                                >
                                    <option value="">Select</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Normal">Normal</option>
                                    <option value="NO">No</option>
                                </select>

                            </div>
                            {(formData.idCards === 'Premium' || formData.idCards === 'Normal') && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                        RFID Integration *
                                    </label>

                                    <select
                                        value={formData.rfidIntegration}
                                        onChange={(e) => updateField('rfidIntegration', e.target.value)}
                                        required
                                        style={getInputStyle('rfidIntegration')}
                                    >
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                    Demo Required *
                                </label>

                                <select
                                    value={formData.demoRequired}
                                    required
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        setFormData(prev => ({
                                            ...prev,
                                            demoRequired: value,
                                            demoDate: null // ALWAYS reset when ID Cards changes
                                        }));
                                    }}
                                    style={getInputStyle('demoRequired')}
                                >
                                    <option value="">Select</option>
                                    <option value="YES">Yes</option>
                                    <option value="NO">No</option>
                                </select>

                            </div>
                            {formData.demoRequired === 'YES' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                        Demo Date *
                                    </label>
                                    <div className="date-input-wrapper" style={{ borderColor: showErrors && !formData.demoDate ? '#ff4d4f' : '#ddd', borderWidth: '1px', borderStyle: 'solid', borderRadius: '6px' }}>
                                        <input
                                            type="date"
                                            value={formData.demoDate || ''}
                                            onChange={(e) => updateField('demoDate', e.target.value)}
                                            required
                                            className="wizard-input"
                                            style={{ border: 'none', width: '100%' }}
                                        />
                                        <Calendar className="calendar-icon-svg" size={18} />
                                    </div>
                                </div>
                            )}


                            {/* <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Demo Required</label><select value={formData.demoRequired} onChange={(e) => updateField('demoRequired', e.target.value)} style={inputStyle}><option value="">Select</option><option value="YES">Yes</option><option value="NO">No</option></select></div> */}
                            {/* <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Demo Date</label><input type="date" value={formData.demoDate} onChange={(e) => updateField('demoDate', e.target.value)} style={inputStyle} /></div> */}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Select Modules *</h3>
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateField(
                                            'selectedModules',
                                            formData.selectedModules.length === modules.length
                                                ? []
                                                : modules.map(m => ({ moduleId: m.id, remarks: '' }))
                                        )
                                    }
                                    style={{
                                        padding: '6px 14px',
                                        background: formData.selectedModules.length === modules.length ? '#f093fb' : '#667eea',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {formData.selectedModules.length === modules.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '12px' }}>
                                {modules.map(module => {
                                    const selectedModule = formData.selectedModules.find(m => m.moduleId === module.id);
                                    const isSelected = !!selectedModule;

                                    return (
                                        <div
                                            key={module.id}
                                            style={{
                                                padding: '14px',
                                                background: isSelected ? '#f0f4ff' : '#f8f9fa',
                                                border: isSelected ? '2px solid #667eea' : (showErrors && formData.selectedModules.length === 0 ? '2px solid #ff4d4f' : '2px solid #e5e5e5'),
                                                borderRadius: '8px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{module.moduleName}</div>
                                                    <div style={{ fontSize: '12px', color: '#555' }}>{module.description}</div>
                                                </div>

                                                {/* Toggle Switch */}
                                                <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
                                                    <div
                                                        style={{
                                                            position: 'relative',
                                                            width: '44px',
                                                            height: '24px',
                                                            background: isSelected ? '#4CAF50' : '#ccc',
                                                            borderRadius: '12px',
                                                            transition: 'background 0.3s'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                updateField(
                                                                    'selectedModules',
                                                                    isSelected
                                                                        ? formData.selectedModules.filter(m => m.moduleId !== module.id)
                                                                        : [...formData.selectedModules, { moduleId: module.id, remarks: '' }]
                                                                )
                                                            }
                                                            style={{ display: 'none' }}
                                                        />
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                top: '2px',
                                                                left: isSelected ? '22px' : '2px',
                                                                width: '20px',
                                                                height: '20px',
                                                                background: '#fff',
                                                                borderRadius: '50%',
                                                                transition: 'left 0.3s',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                            }}
                                                        />
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '600', color: isSelected ? '#4CAF50' : '#999' }}>
                                                        {isSelected ? 'Active' : 'Inactive'}
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Remarks Section */}
                                            {isSelected && (
                                                <textarea
                                                    placeholder="Add remarks (optional)"
                                                    value={selectedModule.remarks}
                                                    onChange={e =>
                                                        updateField(
                                                            'selectedModules',
                                                            formData.selectedModules.map(m =>
                                                                m.moduleId === module.id ? { ...m, remarks: e.target.value } : m
                                                            )
                                                        )
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        background: '#fff',
                                                        color: '#000',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <div style={{ padding: '16px 24px', background: '#f8f9fa', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" onClick={onCancel} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Cancel</button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {currentStep > 0 && <button type="button" onClick={handlePrevious} style={{ padding: '10px 20px', background: '#fff', color: '#667eea', border: '2px solid #667eea', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>← Previous</button>}
                        {currentStep < steps.length - 1 ? (
                            <button type="button" onClick={handleNext} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Next →</button>
                        ) : (
                            <button type="submit" disabled={loading} onClick={handleFormSubmit} style={{ padding: '10px 24px', background: loading ? '#ccc' : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}>{loading ? 'Submitting...' : editingVisit ? 'Update Visit' : 'Submit Visit'}</button>
                        )}
                    </div>
                </div>
                {showCustomFeatureModal && (
                    <div className="sv-modal-overlay">
                        <div className="sv-modal-container">
                            <div className="sv-modal-header">
                                <h3 className="sv-modal-title">Custom Features Required</h3>
                            </div>
                            <div className="sv-modal-body">
                                <p className="sv-modal-helper-text">
                                    Please provide a detailed description of the custom features required for this school.
                                </p>
                                <textarea
                                    className="sv-modal-textarea"
                                    value={customFeatureDescription}
                                    onChange={(e) => setCustomFeatureDescription(e.target.value)}
                                    placeholder="Describe the specific custom features needed..."
                                />
                            </div>
                            <div className="sv-modal-footer">
                                <button
                                    type="button"
                                    className="sv-modal-btn sv-modal-btn-cancel"
                                    onClick={() => {
                                        setShowCustomFeatureModal(false);
                                        updateField('customFeaturesRequired', 'NO');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="sv-modal-btn sv-modal-btn-save"
                                    onClick={() => {
                                        updateField('customFeatureDescription', customFeatureDescription);
                                        setShowCustomFeatureModal(false);
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </form>
        </div>
    );
};

export default SchoolVisitWizard;
