import { useState } from 'react';

let showConfirmation = null;

export const confirmAction = (title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'default') => {
  return new Promise((resolve) => {
    if (showConfirmation) {
      showConfirmation({ title, message, confirmText, cancelText, type, resolve });
    }
  });
};

const ConfirmationModal = ({ isOpen, onClose, title, message, confirmText, cancelText, type, onConfirm }) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          confirmBg: '#dc3545',
          confirmHover: '#c82333',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )
        };
      case 'warning':
        return {
          confirmBg: '#ffc107',
          confirmHover: '#e0a800',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffc107" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4"/>
              <path d="M12 16h.01"/>
            </svg>
          )
        };
      default:
        return {
          confirmBg: '#667eea',
          confirmHover: '#5a67d8',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          )
        };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          {colors.icon}
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#000' }}>
            {title}
          </h3>
        </div>
        
        <p style={{ 
          margin: '0 0 24px 0', 
          color: '#666', 
          fontSize: '14px', 
          lineHeight: '1.5' 
        }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f8f9fa',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#666',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e9ecef';
              e.target.style.borderColor = '#dee2e6';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.borderColor = '#e5e5e5';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              background: colors.confirmBg,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = colors.confirmHover}
            onMouseLeave={(e) => e.target.style.background = colors.confirmBg}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmationProvider = () => {
  const [modal, setModal] = useState(null);

  useState(() => {
    showConfirmation = (config) => {
      setModal(config);
    };
  }, []);

  const handleConfirm = () => {
    if (modal?.resolve) {
      modal.resolve(true);
    }
    setModal(null);
  };

  const handleClose = () => {
    if (modal?.resolve) {
      modal.resolve(false);
    }
    setModal(null);
  };

  return (
    <ConfirmationModal
      isOpen={!!modal}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={modal?.title}
      message={modal?.message}
      confirmText={modal?.confirmText}
      cancelText={modal?.cancelText}
      type={modal?.type}
    />
  );
};

export default ConfirmationProvider;