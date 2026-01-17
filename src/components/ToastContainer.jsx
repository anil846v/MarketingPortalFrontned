import { useState, useEffect } from 'react';

let toastId = 0;
let addToast = null;

export const showToast = (message, type = 'success', duration = 4000) => {
  if (addToast) {
    addToast({ id: ++toastId, message, type, duration });
  }
};

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          background: '#d1f2eb',
          border: '#a7f3d0',
          color: '#065f46',
          iconColor: '#10b981'
        };
      case 'error':
        return {
          background: '#fee2e2',
          border: '#fecaca',
          color: '#991b1b',
          iconColor: '#ef4444'
        };
      case 'warning':
        return {
          background: '#fef3c7',
          border: '#fde68a',
          color: '#92400e',
          iconColor: '#f59e0b'
        };
      case 'info':
        return {
          background: '#dbeafe',
          border: '#bfdbfe',
          color: '#1e40af',
          iconColor: '#3b82f6'
        };
      default:
        return {
          background: '#f3f4f6',
          border: '#d1d5db',
          color: '#374151',
          iconColor: '#6b7280'
        };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        color: colors.color,
        fontSize: '14px',
        fontWeight: '500',
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'slideIn 0.3s ease-out',
        position: 'relative'
      }}
    >
      <div style={{ color: colors.iconColor, flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1 }}>{toast.message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: colors.color,
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToast = (toast) => {
      setToasts(prev => [...prev, toast]);
    };

    return () => {
      addToast = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;