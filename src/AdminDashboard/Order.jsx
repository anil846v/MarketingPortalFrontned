import { useState, useEffect } from 'react';
import { ModalTabs } from './SchoolVisits';
import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
// import "../AdminDashboard/adminmobile.css"

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modules, setModules] = useState([]);
  const [downloadType, setDownloadType] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');

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
    }
  };
  const getModuleName = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.moduleName : `Module ${moduleId}`;
  };

const downloadOrdersPDF = (ordersToDownload, type = 'all') => {
  if (ordersToDownload.length === 0) return;

  const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
  let currentY = 15;

  // ========== COVER PAGE ==========
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('ACCEPTED ORDERS', 14, currentY);
  currentY += 15;

  doc.setFontSize(18);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  const coverTitle = type === 'all' ? 'Comprehensive Report' : `Details: ${ordersToDownload[0].schoolName}`;
  doc.text(coverTitle, 14, currentY);
  currentY += 20;

  // Report Info
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
  doc.text(`Total Orders: ${ordersToDownload.length}`, 14, currentY);
  currentY += 6;
  doc.text(`Report Type: ${type === 'all' ? 'All Orders' : 'Individual Order'}`, 14, currentY);
  currentY += 20;

  // Summary Section
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  doc.text('Summary Metrics', 14, currentY);
  currentY += 8;

  const summaryData = [
    ['Total Orders', ordersToDownload.length.toString()],
    ['Total Budget Range', `₹${ordersToDownload.reduce((sum, o) => sum + (parseFloat(o.budgetRange) || 0), 0).toLocaleString()}`],
    ['Total Initial Payment', `₹${ordersToDownload.reduce((sum, o) => sum + (parseFloat(o.initialPayment) || 0), 0).toLocaleString()}`],
    ['Pending Orders', ordersToDownload.filter(o => o.status === 'PENDING').length.toString()],
    ['Accepted Orders', ordersToDownload.filter(o => o.status === 'ACCEPTED').length.toString()]
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

  // Overview Table - Summary of all orders
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  doc.text('Orders Overview', 14, currentY);
  currentY += 8;

  const tableHead = [
    ['#', 'School Name', 'Order Date', 'Go Live Date', 'Payment', 'Status']
  ];

  const tableBody = ordersToDownload.map((order, index) => [
    (index + 1).toString(),
    order.schoolName || 'N/A',
    order.orderBookingDate || 'N/A',
    order.expectedGoLiveDate || 'N/A',
    `₹${parseFloat(order.initialPayment || 0).toLocaleString()}`,
    order.status || 'N/A'
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
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 42, halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 48, halign: 'left', fontStyle: 'bold' },
      5: { cellWidth: 40, halign: 'center' }
    }
  });

  // ========== DETAILED PAGES FOR EACH ORDER ==========
  ordersToDownload.forEach((order, orderIndex) => {
    doc.addPage('a4', 'portrait');
    let pageY = 15;

    // Header with order number and school name
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text(`ORDER #${orderIndex + 1}`, 14, pageY);
    pageY += 8;

    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(70, 90, 110);
    doc.text(order.schoolName || 'N/A', 14, pageY);
    pageY += 10;

    // Divider line
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.5);
    doc.line(14, pageY, 196, pageY);
    pageY += 8;

    // Meta Info
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Order ID: ${order.id || 'N/A'} | Created: ${order.createdAt || 'N/A'} | Status: ${order.status || 'N/A'}`, 14, pageY);
    pageY += 8;

    // BASIC INFORMATION
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('BASIC INFORMATION', 14, pageY);
    pageY += 6;

    const basicData = [
      ['School Name', order.schoolName || 'N/A'],
      ['Visit Date', order.visitedDate || 'N/A'],
      ['Location City', order.locationCity || 'N/A'],
      ['Marketing Executive', order.marketingExecutiveName || 'N/A'],
      ['Status', order.status || 'N/A']
    ];

    autoTable(doc, {
      startY: pageY,
      body: basicData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 5, overflow: 'hidden', valign: 'top' },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: [236, 240, 241], textColor: [44, 62, 80], halign: 'left' },
        1: { cellWidth: 115, textColor: [50, 50, 50], halign: 'left' }
      },
      margin: { left: 14, right: 14 }
    });
    pageY = doc.lastAutoTable.finalY + 8;

    // CONTACT INFORMATION
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('CONTACT INFORMATION', 14, pageY);
    pageY += 6;

    const contactData = [
      ['Contact Person', order.contactPersonName || 'N/A'],
      ['Designation', order.designation || 'N/A'],
      ['Contact No', order.contactNo || 'N/A'],
      ['Email ID', order.emailId || 'N/A'],
      ['School Strength', order.schoolStrenght || 'N/A'],
      ['No of Users', order.noOfUsers || 'N/A'],
      ['Current System', order.currentSystem || 'N/A']
    ];

    autoTable(doc, {
      startY: pageY,
      body: contactData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 5, overflow: 'hidden', valign: 'top' },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: [236, 240, 241], textColor: [44, 62, 80], halign: 'left' },
        1: { cellWidth: 115, textColor: [50, 50, 50], halign: 'left' }
      },
      margin: { left: 14, right: 14 }
    });
    pageY = doc.lastAutoTable.finalY + 8;

    // ORDER DETAILS
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('ORDER DETAILS', 14, pageY);
    pageY += 6;

    const orderData = [
      ['Order Booking Date', order.orderBookingDate || 'N/A'],
      ['Expected Go Live Date', order.expectedGoLiveDate || 'N/A'],
      ['Initial Payment', `₹${parseFloat(order.initialPayment || 0).toLocaleString()}`],
      ['Budget Range', `₹${parseFloat(order.budgetRange || 0).toLocaleString()}`],
      ['Payment Terms', order.paymentTerms || 'N/A'],
      ['Cost Per Member', `₹${parseFloat(order.costPerMember || 0).toLocaleString()}`],
      ['Payment Gateway Preference', order.paymentGatewayPreference || 'N/A']
    ];

    autoTable(doc, {
      startY: pageY,
      body: orderData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 5, overflow: 'hidden', valign: 'top' },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: [236, 240, 241], textColor: [44, 62, 80], halign: 'left' },
        1: { cellWidth: 115, textColor: [50, 50, 50], halign: 'left' }
      },
      margin: { left: 14, right: 14 }
    });
    pageY = doc.lastAutoTable.finalY + 8;

    // REQUIREMENTS
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('REQUIREMENTS', 14, pageY);
    pageY += 6;

    const requirementsData = [
      ['Data Migration Required', order.dataMigrationRequired || 'N/A'],
      ['Custom Features Required', order.customFeaturesRequired || 'N/A'],
      ['RFID Integration', order.rfidIntegration || 'N/A'],
      ['ID Cards', order.idCards || 'N/A']
    ];

    autoTable(doc, {
      startY: pageY,
      body: requirementsData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 5, overflow: 'hidden', valign: 'top' },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: [236, 240, 241], textColor: [44, 62, 80], halign: 'left' },
        1: { cellWidth: 115, textColor: [50, 50, 50], halign: 'left' }
      },
      margin: { left: 14, right: 14 }
    });
    pageY = doc.lastAutoTable.finalY + 8;

    // SALES PIPELINE
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('SALES PIPELINE', 14, pageY);
    pageY += 6;

    const salesData = [
      ['Decision Maker Name', order.decisionMakerName || 'N/A'],
      ['Decision Timeline (Days)', order.decisionTimeline || 'N/A'],
      ['Demo Required', order.demoRequired || 'N/A'],
      ['Demo Date', order.demoDate || 'N/A'],
      ['Proposal Sent', order.proposalSent || 'N/A'],
      ['Proposal Date', order.proposalDate || 'N/A']
    ];

    autoTable(doc, {
      startY: pageY,
      body: salesData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 5, overflow: 'hidden', valign: 'top' },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: [236, 240, 241], textColor: [44, 62, 80], halign: 'left' },
        1: { cellWidth: 115, textColor: [50, 50, 50], halign: 'left' }
      },
      margin: { left: 14, right: 14 }
    });
    pageY = doc.lastAutoTable.finalY + 8;

    // SELECTED MODULES
    if (order.selectedModules && order.selectedModules.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);
      doc.text('SELECTED MODULES', 14, pageY);
      pageY += 6;

      const modulesData = order.selectedModules.map((mod, idx) => [
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

  const filename = type === 'all'
    ? `Accepted_Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`
    : `Order_${ordersToDownload[0].schoolName}_${new Date().toISOString().split('T')[0]}.pdf`;

  doc.save(filename);
};

const downloadOrdersExcel = (ordersToDownload, type = 'all') => {
  if (ordersToDownload.length === 0) return;

  // Summary Sheet
  const summarySheet = [
    ['ACCEPTED ORDERS - SUMMARY REPORT'],
    ['Generated on:', new Date().toLocaleDateString()],
    ['Total Orders:', ordersToDownload.length],
    ['Total Budget Range:', ordersToDownload.reduce((sum, o) => sum + (parseFloat(o.budgetRange) || 0), 0)],
    ['Total Initial Payment:', ordersToDownload.reduce((sum, o) => sum + (parseFloat(o.initialPayment) || 0), 0)],
    []
  ];

  // Overview Sheet Data
  const overviewData = [
    ['#', 'School Name', 'Visit Date', 'Order Date', 'Go Live Date', 'Contact Person', 'Contact No', 'Initial Payment', 'Budget Range', 'Decision Maker', 'Decision Timeline', 'Demo Required', 'Demo Date', 'Proposal Sent', 'Proposal Date', 'Payment Terms', 'Cost Per Member', 'Current System', 'No of Users', 'School Strength', 'Data Migration', 'Custom Features', 'RFID Integration', 'ID Cards', 'Payment Gateway', 'Status']
  ];

  ordersToDownload.forEach((order, idx) => {
    overviewData.push([
      idx + 1,
      order.schoolName || 'N/A',
      order.visitedDate || 'N/A',
      order.orderBookingDate || 'N/A',
      order.expectedGoLiveDate || 'N/A',
      order.contactPersonName || 'N/A',
      order.contactNo || 'N/A',
      parseFloat(order.initialPayment || 0),
      parseFloat(order.budgetRange || 0),
      order.decisionMakerName || 'N/A',
      order.decisionTimeline || 'N/A',
      order.demoRequired || 'N/A',
      order.demoDate || 'N/A',
      order.proposalSent || 'N/A',
      order.proposalDate || 'N/A',
      order.paymentTerms || 'N/A',
      parseFloat(order.costPerMember || 0),
      order.currentSystem || 'N/A',
      order.noOfUsers || 'N/A',
      order.schoolStrenght || 'N/A',
      order.dataMigrationRequired || 'N/A',
      order.customFeaturesRequired || 'N/A',
      order.rfidIntegration || 'N/A',
      order.idCards || 'N/A',
      order.paymentGatewayPreference || 'N/A',
      order.status || 'N/A'
    ]);
  });

  // Modules Sheet
  const modulesData = [
    ['School Name', 'Module Name', 'Selected', 'Remarks']
  ];

  ordersToDownload.forEach((order) => {
    if (order.selectedModules && order.selectedModules.length > 0) {
      order.selectedModules.forEach((mod) => {
        modulesData.push([
          order.schoolName,
          getModuleName(mod.moduleId),
          mod.isSelected || 'N/A',
          mod.remarks || 'N/A'
        ]);
      });
    }
  });

  // Create workbook
  const wb = XLSX.utils.book_new();
  wb.Sheets['Summary'] = XLSX.utils.aoa_to_sheet(summarySheet);
  wb.Sheets['Overview'] = XLSX.utils.aoa_to_sheet(overviewData);
  wb.Sheets['Modules'] = XLSX.utils.aoa_to_sheet(modulesData);
  
  wb.SheetNames.push('Summary', 'Overview', 'Modules');

  // Style columns
  const sheets = ['Summary', 'Overview', 'Modules'];
  sheets.forEach(sheet => {
    if (wb.Sheets[sheet]) {
      const ws = wb.Sheets[sheet];
      for (let key in ws) {
        if (key.startsWith('!')) continue;
        if (ws[key].v) ws[key].s = { alignment: { wrapText: true } };
      }
      ws['!cols'] = Array(30).fill({ wch: 18 });
    }
  });

  const filename = type === 'all'
    ? `Accepted_Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`
    : `Order_${ordersToDownload[0].schoolName}_${new Date().toISOString().split('T')[0]}.xlsx`;

  XLSX.writeFile(wb, filename);
};

const handleDownload = () => {
  let ordersToDownload = orders;
  
  if (downloadType === 'individual' && selectedSchool) {
    ordersToDownload = orders.filter(o => o.schoolName === selectedSchool);
  }

  if (ordersToDownload.length === 0) {
    alert('No orders to download');
    return;
  }

  if (exportFormat === 'pdf') {
    downloadOrdersPDF(ordersToDownload, downloadType);
  } else {
    downloadOrdersExcel(ordersToDownload, downloadType);
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
        {/* Export Controls */}
        <div style={{padding: '20px', borderBottom: '2px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', background: '#fafbfc', flexWrap: 'wrap'}}>
          <div style={{flex: 1, minWidth: '300px'}}>
            <label style={{display: 'block', fontSize: '12px', fontWeight: '700', color: '#44546f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'}}>Export Type</label>
            <select 
              value={downloadType}
              onChange={(e) => {
                setDownloadType(e.target.value);
                setSelectedSchool('');
              }}
              style={{width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: '500'}}
            >
              <option value="all">All Orders</option>
              <option value="individual">Specific School</option>
            </select>
          </div>

          {downloadType === 'individual' && (
            <div style={{flex: 1, minWidth: '300px'}}>
              <label style={{display: 'block', fontSize: '12px', fontWeight: '700', color: '#44546f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'}}>Select School</label>
              <select 
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                style={{width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: '500'}}
              >
                <option value="">Choose a school...</option>
                {[...new Set(orders.map(o => o.schoolName))].map((school, idx) => (
                  <option key={idx} value={school}>{school}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{flex: 1, minWidth: '300px'}}>
            <label style={{display: 'block', fontSize: '12px', fontWeight: '700', color: '#44546f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'}}>File Format</label>
            <div style={{display: 'flex', gap: '8px'}}>
              <button
                onClick={() => setExportFormat('pdf')}
                style={{flex: 1, padding: '10px 16px', background: exportFormat === 'pdf' ? 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' : '#ecf0f1', color: exportFormat === 'pdf' ? 'white' : '#2c3e50', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'}}
              >
                PDF
              </button>
              <button
                onClick={() => setExportFormat('excel')}
                style={{flex: 1, padding: '10px 16px', background: exportFormat === 'excel' ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)' : '#ecf0f1', color: exportFormat === 'excel' ? 'white' : '#27ae60', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'}}
              >
                Excel
              </button>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={orders.length === 0 || (downloadType === 'individual' && !selectedSchool)}
            style={{padding: '12px 28px', background: (orders.length === 0 || (downloadType === 'individual' && !selectedSchool)) ? '#bdc3c7' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: (orders.length === 0 || (downloadType === 'individual' && !selectedSchool)) ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'}}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)')}
            onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download {exportFormat.toUpperCase()}
          </button>
        </div>

<table className="responsive-table" style={{width: '100%', borderCollapse: 'collapse'}}>
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
            {orders.map((order, index) => (
              <tr key={order.id} style={{borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                <td data-label="School Name" style={{padding: '16px', fontSize: '14px', color: '#333'}}>{index + 1}</td>
                <td data-label="Order Date" style={{padding: '16px', fontSize: '14px', fontWeight: '600', color: '#000'}}>{order.schoolName}</td>
                <td data-label="Go Live Date" style={{padding: '16px', fontSize: '14px', color: '#333'}}>{order.orderBookingDate}</td>
                <td data-label="School Name"style={{padding: '16px', fontSize: '14px', color: '#333'}}>{order.expectedGoLiveDate}</td>
                <td data-label="Initial Payment"style={{padding: '16px', fontSize: '14px', fontWeight: '600', color: '#4CAF50'}}>₹{order.initialPayment}</td>
                <td data-label="Status"style={{padding: '16px', fontSize: '14px', color: '#333'}}>{order.status}</td>
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
