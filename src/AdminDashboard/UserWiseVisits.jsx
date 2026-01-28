import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/ToastContainer';
import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../assets/userwisevistsstyle.css';

const UserWiseVisits = () => {
    const [usersWithStats, setUsersWithStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('summary'); // 'summary', 'details', 'full-details'
    const [selectedUser, setSelectedUser] = useState(null);
    const [userVisits, setUserVisits] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [modules, setModules] = useState([]);

    // Export state
    const [exportTarget, setExportTarget] = useState('ALL'); // 'ALL' or userId

    useEffect(() => {
        fetchAllData();
        fetchModules();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const usersRes = await fetch(`${API_BASE_URL}/admin/marketing-users`, {
                credentials: 'include'
            });
            const usersData = await usersRes.json();
            if (!usersRes.ok) throw new Error('Failed to fetch users');

            const users = usersData.users || [];
            const statsPromises = users.map(async (user) => {
                try {
                    const visitsRes = await fetch(`${API_BASE_URL}/admin/schoolvisits-user/${user.userId}`, {
                        credentials: 'include'
                    });
                    if (!visitsRes.ok) return { ...user, stats: { accepted: 0, rejected: 0, pending: 0, total: 0 }, visits: [] };
                    const visits = await visitsRes.json();
                    const stats = visits.reduce((acc, visit) => {
                        const status = visit.status?.toUpperCase();
                        if (status === 'ACCEPTED') acc.accepted++;
                        else if (status === 'REJECTED') acc.rejected++;
                        else if (status === 'PENDING') acc.pending++;
                        acc.total++;
                        return acc;
                    }, { accepted: 0, rejected: 0, pending: 0, total: 0 });
                    return { ...user, stats, visits };
                } catch (err) {
                    return { ...user, stats: { accepted: 0, rejected: 0, pending: 0, total: 0 }, visits: [] };
                }
            });

            const results = await Promise.all(statsPromises);
            setUsersWithStats(results);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchModules = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/modules`, { credentials: 'include' });
            const data = await response.json();
            if (response.ok) setModules(data);
        } catch (error) {
            console.error("Module fetch failed", error);
        }
    };

    const getModuleName = (moduleId) => {
        const module = modules.find(m => m.id === moduleId);
        return module ? module.moduleName : `Module ${moduleId}`;
    };

    const handleViewDetails = async (user) => {
        setSelectedUser(user);
        setView('details');
        setDetailsLoading(true);
        setFilterStatus('ALL');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/schoolvisits-user/${user.userId}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUserVisits(data);
            } else {
                showToast('Failed to fetch user visits', 'error');
            }
        } catch (error) {
            showToast('Connection error', 'error');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewFullDetails = (visit) => {
        setSelectedVisit(visit);
        setView('full-details');
    };

    // --- Export Logic ---

    const exportToPDF = (data, title = "School Visits Report") => {
        if (!data || data.length === 0) {
            showToast("No data to export", "warning");
            return;
        }

        const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
        let currentY = 15;

        // ========== COVER PAGE ==========
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text('USER-WISE SCHOOL VISITS', 14, currentY);
        currentY += 15;

        doc.setFontSize(18);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(title, 14, currentY);
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
        doc.text(`Total Visits Captured: ${data.length}`, 14, currentY);
        currentY += 20;

        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        doc.text('Status Summary', 14, currentY);
        currentY += 8;

        const summaryData = [
            ['Accepted', data.filter(v => v.status?.toUpperCase() === 'ACCEPTED').length.toString()],
            ['Pending', data.filter(v => v.status?.toUpperCase() === 'PENDING').length.toString()],
            ['Rejected', data.filter(v => v.status?.toUpperCase() === 'REJECTED').length.toString()],
            ['Total', data.length.toString()]
        ];

        autoTable(doc, {
            startY: currentY,
            head: [['Metric', 'Count']],
            body: summaryData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 6 },
            headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { textColor: [50, 50, 50] },
            columnStyles: { 0: { cellWidth: 75 }, 1: { cellWidth: 65, fontStyle: 'bold' } },
            margin: { left: 14 }
        });

        // ========== DETAILED PAGES FOR EACH VISIT ==========
        data.forEach((visit, visitIndex) => {
            doc.addPage('a4', 'portrait');
            let pageY = 15;

            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(44, 62, 80);
            doc.text(`VISIT RECORD #${visitIndex + 1}`, 14, pageY);
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
            doc.text(`Visit ID: ${visit.id || 'N/A'} | Date: ${visit.visitedDate || 'N/A'} | Executive: ${visit.marketingExecutiveName || 'N/A'}`, 14, pageY);
            pageY += 8;

            const sections = [
                {
                    title: 'BASIC INFORMATION',
                    data: [
                        ['School Name', visit.schoolName || 'N/A'],
                        ['Visit Date', visit.visitedDate || 'N/A'],
                        ['Location City', visit.locationCity || 'N/A'],
                        ['Marketing Executive', visit.marketingExecutiveName || 'N/A'],
                        ['Status', visit.status || 'N/A'],
                        ['Created At', visit.createdAt || 'N/A']
                    ]
                },
                {
                    title: 'CONTACT & SCHOOL DETAILS',
                    data: [
                        ['Contact Person', visit.contactPersonName || 'N/A'],
                        ['Designation', visit.designation || 'N/A'],
                        ['Contact No', visit.contactNo || 'N/A'],
                        ['Email ID', visit.emailId || 'N/A'],
                        ['School Strength', visit.schoolStrenght || 'N/A'],
                        ['Current System', visit.currentSystem || 'N/A']
                    ]
                },
                {
                    title: 'REQUIREMENTS & SETUP',
                    data: [
                        ['Platform Required', visit.requiredplatform || 'N/A'],
                        ['No of Users', visit.noOfUsers || 'N/A'],
                        ['Data Migration Required', visit.dataMigrationRequired || 'N/A'],
                        ['Custom Features Required', visit.customFeaturesRequired || 'N/A'],
                        ['Custom Features Detail', visit.customFeatureDescription || 'N/A'],
                        ['RFID Integration', visit.rfidIntegration || 'N/A'],
                        ['ID Cards Needed', visit.idCards || 'N/A']
                    ]
                },
                {
                    title: 'ORDER & PAYMENT DETAILS',
                    data: [
                        ['Expected Go Live Date', visit.expectedGoLiveDate || 'N/A'],
                        ['Order Booking Date', visit.orderBookingDate || 'N/A'],
                        ['Initial Payment', visit.initialPayment ? `₹${parseFloat(visit.initialPayment).toLocaleString()}` : 'N/A'],
                        ['Payment Terms', visit.paymentTerms || 'N/A'],
                        ['Cost Per Member', visit.costPerMember ? `₹${parseFloat(visit.costPerMember).toLocaleString()}` : 'N/A'],
                        ['Budget Range', visit.budgetRange ? `₹${parseFloat(visit.budgetRange).toLocaleString()}` : 'N/A'],
                        ['Billing Frequency', visit.billingFrequency || 'N/A'],
                        ['Payment Gateway Pref.', visit.paymentGatewayPreference || 'N/A']
                    ]
                },
                {
                    title: 'SALES PIPELINE',
                    data: [
                        ['Decision Maker', visit.decisionMakerName || 'N/A'],
                        ['Decision Timeline', visit.decisionTimeline ? `${visit.decisionTimeline} Days` : 'N/A'],
                        ['Demo Required', visit.demoRequired || 'N/A'],
                        ['Demo Date', visit.demoDate || 'N/A'],
                        ['Proposal Sent', visit.proposalSent || 'N/A'],
                        ['Proposal Date', visit.proposalDate || 'N/A']
                    ]
                }
            ];

            // Add rejection reason if applicable
            if (visit.status?.toUpperCase() === 'REJECTED' && visit.rejectionReason) {
                sections[0].data.push(['Rejection Reason', visit.rejectionReason]);
            }

            sections.forEach((section) => {
                if (pageY > 250) { doc.addPage(); pageY = 20; }
                doc.setFont(undefined, 'bold');
                doc.setFontSize(11);
                doc.setTextColor(44, 62, 80);
                doc.text(section.title, 14, pageY);
                pageY += 6;

                autoTable(doc, {
                    startY: pageY,
                    body: section.data,
                    theme: 'plain',
                    styles: { fontSize: 9, cellPadding: 4, overflow: 'hidden', valign: 'top' },
                    columnStyles: {
                        0: { cellWidth: 50, fontStyle: 'bold', fillColor: [236, 240, 241], textColor: [44, 62, 80] },
                        1: { cellWidth: 115, textColor: [50, 50, 50] }
                    },
                    margin: { left: 14 }
                });
                pageY = doc.lastAutoTable.finalY + 8;
            });

            // Selected Modules Section
            if (visit.selectedModules && visit.selectedModules.length > 0) {
                if (pageY > 240) { doc.addPage(); pageY = 20; }
                doc.setFont(undefined, 'bold');
                doc.setFontSize(11);
                doc.setTextColor(44, 62, 80);
                doc.text('SELECTED MODULES', 14, pageY);
                pageY += 6;

                const modulesData = visit.selectedModules.map((mod, idx) => [
                    (idx + 1).toString(),
                    getModuleName(mod.moduleId),
                    mod.remarks || 'N/A'
                ]);

                autoTable(doc, {
                    startY: pageY,
                    head: [['#', 'Module Name', 'Remarks']],
                    body: modulesData,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 4 },
                    headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' },
                    columnStyles: { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 60 }, 2: { cellWidth: 90 } },
                    margin: { left: 14 }
                });
            }
        });

        doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`);
    };

    const exportToExcel = (data, title = "School_Visits_Report") => {
        if (!data || data.length === 0) {
            showToast("No data to export", "warning");
            return;
        }

        const overviewData = [['#', 'School Name', 'Visit Date', 'Contact Person', 'Designation', 'Contact No', 'Email', 'Marketing Exec', 'Location', 'School Strength', 'No of Users', 'Current System', 'Platform Required', 'Billing Frequency', 'Decision Maker', 'Decision Timeline', 'Order Date', 'Go Live Date', 'Initial Payment', 'Budget Range', 'Payment Terms', 'Cost Per Member', 'Demo Required', 'Demo Date', 'Proposal Sent', 'Proposal Date', 'Data Migration', 'Custom Features', 'Custom Feature Details', 'RFID Integration', 'ID Cards', 'Payment Gateway', 'Rejection Reason', 'Status']];
        data.forEach((v, idx) => {
            overviewData.push([
                idx + 1,
                v.schoolName || 'N/A',
                v.visitedDate || 'N/A',
                v.contactPersonName || 'N/A',
                v.designation || 'N/A',
                v.contactNo || 'N/A',
                v.emailId || 'N/A',
                v.marketingExecutiveName || 'N/A',
                v.locationCity || 'N/A',
                v.schoolStrenght || 'N/A',
                v.noOfUsers || 'N/A',
                v.currentSystem || 'N/A',
                v.requiredplatform || 'N/A',
                v.billingFrequency || 'N/A',
                v.decisionMakerName || 'N/A',
                v.decisionTimeline || 'N/A',
                v.orderBookingDate || 'N/A',
                v.expectedGoLiveDate || 'N/A',
                parseFloat(v.initialPayment || 0),
                parseFloat(v.budgetRange || 0),
                v.paymentTerms || 'N/A',
                parseFloat(v.costPerMember || 0),
                v.demoRequired || 'N/A',
                v.demoDate || 'N/A',
                v.proposalSent || 'N/A',
                v.proposalDate || 'N/A',
                v.dataMigrationRequired || 'N/A',
                v.customFeaturesRequired || 'N/A',
                v.customFeatureDescription || 'N/A',
                v.rfidIntegration || 'N/A',
                v.idCards || 'N/A',
                v.paymentGatewayPreference || 'N/A',
                v.rejectionReason || 'N/A',
                v.status || 'N/A'
            ]);
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Detailed Visits");
        XLSX.writeFile(workbook, `${title}_${new Date().toLocaleDateString()}.xlsx`);
    };

    const handleExport = (format) => {
        let exportData = [];
        let title = "";

        if (exportTarget === 'ALL') {
            exportData = usersWithStats.flatMap(u => u.visits || []);
            title = "All Users Combined School Visits Report";
        } else {
            const user = usersWithStats.find(u => u.userId === parseInt(exportTarget));
            exportData = user?.visits || [];
            title = `${user?.fullName || 'User'}'s School Visits Report`;
        }

        if (format === 'pdf') exportToPDF(exportData, title);
        else exportToExcel(exportData, title.replace(/\s+/g, '_'));
    };

    // --- UI Components ---

    const StatusBadge = ({ status }) => {
        const styles = {
            ACCEPTED: { bg: '#e6fffa', color: '#2c7a7b' },
            REJECTED: { bg: '#fff5f5', color: '#c53030' },
            PENDING: { bg: '#fffaf0', color: '#975a16' }
        };
        const style = styles[status?.toUpperCase()] || { bg: '#f7fafc', color: '#4a5568' };

        let badgeType = "";
        const ucStatus = status?.toUpperCase();
        if (ucStatus === 'ACCEPTED') badgeType = "uw-badge-accepted";
        else if (ucStatus === 'REJECTED') badgeType = "uw-badge-rejected";
        else if (ucStatus === 'PENDING') badgeType = "uw-badge-pending";

        return (
            <span
                className={`uw-status-badge ${badgeType}`}
                style={!badgeType ? { background: style.bg, color: style.color } : {}}
            >
                {status}
            </span>
        );
    };

    const DetailRow = ({ label, value }) => (
        <div className="uw-fd-row">
            <div className="uw-fd-label">{label}</div>
            <div className="uw-fd-value">{value || 'N/A'}</div>
        </div>
    );

    if (loading) return <LoadingSpinner message="Calculating user performance..." />;

    if (view === 'full-details') {
        return (
            <div className="full-details-view">
                <button onClick={() => setView('details')} className="uw-back-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Visit List
                </button>

                <div className="uw-fd-card">
                    <div className="uw-fd-header">
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1a202c', fontWeight: '700' }}>{selectedVisit.schoolName}</h2>
                            <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Visit ID: #{selectedVisit.id}</p>
                        </div>
                        <StatusBadge status={selectedVisit.status} />
                    </div>

                    <div className="uw-fd-body">
                        <div className="uw-fd-main-grid">
                            <div>
                                <h3 className="uw-fd-section-title">Basic & Contact Details</h3>
                                <DetailRow label="Visit Date" value={selectedVisit.visitedDate} />
                                <DetailRow label="Location City" value={selectedVisit.locationCity} />
                                <DetailRow label="Contact Person" value={selectedVisit.contactPersonName} />
                                <DetailRow label="Designation" value={selectedVisit.designation} />
                                <DetailRow label="Contact No" value={selectedVisit.contactNo} />
                                <DetailRow label="Email ID" value={selectedVisit.emailId} />
                                <DetailRow label="School Strength" value={selectedVisit.schoolStrenght} />
                                <DetailRow label="Current System" value={selectedVisit.currentSystem} />
                            </div>

                            <div>
                                <h3 className="uw-fd-section-title">Requirement & Order</h3>
                                <DetailRow label="Required Platform" value={selectedVisit.requiredplatform} />
                                <DetailRow label="No of Users" value={selectedVisit.noOfUsers} />
                                <DetailRow label="Data Migration" value={selectedVisit.dataMigrationRequired} />
                                <DetailRow label="Custom Features" value={selectedVisit.customFeaturesRequired} />
                                <DetailRow label="RFID Integration" value={selectedVisit.rfidIntegration} />
                                <DetailRow label="ID Cards Needed" value={selectedVisit.idCards} />
                                <DetailRow label="Billing Frequency" value={selectedVisit.billingFrequency} />
                                <DetailRow label="Expected Go Live" value={selectedVisit.expectedGoLiveDate} />
                                {selectedVisit.status === 'ACCEPTED' && (
                                    <>
                                        <DetailRow label="Initial Payment" value={selectedVisit.initialPayment} />
                                        <DetailRow label="Order Booking Date" value={selectedVisit.orderBookingDate} />
                                    </>
                                )}
                                {selectedVisit.status === 'REJECTED' && (
                                    <DetailRow label="Rejection Reason" value={selectedVisit.rejectionReason} />
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '32px' }}>
                            <h3 className="uw-fd-section-title">Decision & Sales Pipeline</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                <DetailRow label="Decision Maker" value={selectedVisit.decisionMakerName} />
                                <DetailRow label="Decision Timeline" value={selectedVisit.decisionTimeline + " Days"} />
                                <DetailRow label="Demo Required" value={selectedVisit.demoRequired} />
                                <DetailRow label="Demo Date" value={selectedVisit.demoDate} />
                                <DetailRow label="Proposal Sent" value={selectedVisit.proposalSent} />
                                <DetailRow label="Proposal Date" value={selectedVisit.proposalDate} />
                                <DetailRow label="Budget Range" value={selectedVisit.budgetRange} />
                            </div>
                        </div>

                        {selectedVisit.selectedModules && selectedVisit.selectedModules.length > 0 && (
                            <div style={{ marginTop: '32px' }}>
                                <h3 className="uw-fd-section-title">Selected Modules</h3>
                                <div className="uw-modules-container">
                                    {selectedVisit.selectedModules.map((mod, idx) => (
                                        <div key={idx} className="uw-module-tag">
                                            Module ID: {mod.moduleId} {mod.remarks && `(${mod.remarks})`}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'details') {
        const filteredVisits = filterStatus === 'ALL'
            ? userVisits
            : userVisits.filter(v => v.status?.toUpperCase() === filterStatus);

        return (
            <div className="user-visits-detail">
                <div className="uw-detail-container">
                    <button onClick={() => setView('summary')} className="uw-back-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Summary
                    </button>

                    <div className="uw-detail-header-flex">
                        <div className="uw-user-info-section">
                            {selectedUser.profilePhotoPath ? (
                                <img src={`${API_BASE_URL}${selectedUser.profilePhotoPath}`} alt="" className="uw-user-avatar" />
                            ) : (
                                <div className="uw-user-avatar-placeholder">
                                    {selectedUser.fullName?.[0]}
                                </div>
                            )}
                            <div>
                                <h2 style={{ margin: 0, fontSize: '22px', color: '#333' }}>{selectedUser.fullName}</h2>
                                <p className="uw-subtitle">Visit History • {userVisits.length} Total Visits</p>
                            </div>
                        </div>

                        <div className="uw-filter-bar">
                            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(status => {
                                const count = status === 'ALL'
                                    ? userVisits.length
                                    : userVisits.filter(v => v.status?.toUpperCase() === status).length;

                                return (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`uw-filter-btn ${filterStatus === status ? 'uw-filter-btn-active' : ''}`}
                                    >
                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                        <span className={`uw-filter-count ${filterStatus === status ? 'uw-count-active' : 'uw-count-inactive'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {detailsLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading visits...</div>
                ) : (
                    <div className="uw-visits-grid">
                        {filteredVisits.map((visit) => (
                            <div key={visit.id} className="uw-card">
                                <div className="uw-card-header">
                                    <div className="uw-card-icon-box">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                    </div>
                                    <StatusBadge status={visit.status} />
                                </div>

                                <h3 className="uw-card-title">{visit.schoolName}</h3>
                                <p className="uw-card-location">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {visit.locationCity || 'Unknown City'}
                                </p>

                                <div className="uw-card-info-grid">
                                    <div>
                                        <label className="uw-info-label">Contact</label>
                                        <div className="uw-info-value">{visit.contactPersonName || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label className="uw-info-label">Visit Date</label>
                                        <div className="uw-info-value">{visit.visitedDate || 'N/A'}</div>
                                    </div>
                                </div>

                                <button onClick={() => handleViewFullDetails(visit)} className="uw-card-view-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    View Full Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!detailsLoading && filteredVisits.length === 0 && (
                    <div style={{ padding: '80px 40px', textAlign: 'center', background: 'white', borderRadius: '12px', marginTop: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                        <h3 style={{ margin: 0, color: '#333' }}>No {filterStatus.toLowerCase()} visits found</h3>
                        <p style={{ color: '#666' }}>This executive hasn't recorded any visits with this status yet.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="uw-section">
            <div className="uw-header-container">
                <div className="uw-title-area">
                    <div className="uw-icon-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                        </svg>
                    </div>
                    <div className="uw-title-text-group">
                        <h2 className="uw-title">User-Wise Visits</h2>
                        <p className="uw-subtitle">Performance summary of marketing executives</p>
                    </div>
                </div>

                {/* Export Control Center */}
                <div className="uw-export-center">
                    <div className="uw-export-group">
                        <label className="uw-export-label">Export Data For:</label>
                        <select
                            value={exportTarget}
                            onChange={(e) => setExportTarget(e.target.value)}
                            className="uw-select"
                        >
                            <option value="ALL">All Executives</option>
                            {usersWithStats.map(u => (
                                <option key={u.userId} value={u.userId}>{u.fullName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="uw-export-actions">
                        <button onClick={() => handleExport('pdf')} className="uw-btn-pdf" title="Download PDF Report">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Export PDF
                        </button>
                        <button onClick={() => handleExport('excel')} className="uw-btn-excel" title="Download Excel Report">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                <path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4"></path>
                                <path d="M9 15.5l3 3 3-3"></path>
                                <path d="M12 12v6.5"></path>
                            </svg>
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            <div className="uw-table-container">
                <table className="responsive-table">
                    <thead>
                        <tr>
                            <th>Executive Name</th>
                            <th style={{ textAlign: 'center' }}>Accepted</th>
                            <th style={{ textAlign: 'center' }}>Rejected</th>
                            <th style={{ textAlign: 'center' }}>Pending</th>
                            <th style={{ textAlign: 'center' }}>Total Visits</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersWithStats.map((user) => (
                            <tr key={user.userId}>
                                <td>
                                    <div className="uw-executive-cell">
                                        {user.profilePhotoPath ? (
                                            <img
                                                src={`${API_BASE_URL}${user.profilePhotoPath}`}
                                                alt=""
                                                className="uw-profile-img"
                                            />
                                        ) : (
                                            <div className="uw-profile-placeholder">
                                                {user.fullName?.[0] || 'U'}
                                            </div>
                                        )}
                                        <div>
                                            <div className="uw-executive-name">{user.fullName}</div>
                                            <div className="uw-executive-region">{user.assignedRegion || 'No Region'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="uw-stat-badge uw-badge-accepted">
                                        {user.stats.accepted}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="uw-stat-badge uw-badge-rejected">
                                        {user.stats.rejected}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="uw-stat-badge uw-badge-pending">
                                        {user.stats.pending}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                    {user.stats.total}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="uw-view-all-btn" onClick={() => handleViewDetails(user)}>
                                        View All
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {usersWithStats.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        No marketing users found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserWiseVisits;
