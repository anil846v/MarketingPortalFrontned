import { useState, useEffect } from 'react';
import { showToast } from '../components/ToastContainer';

const API_BASE_URL = 'http://localhost:9090';

const ModulesSection = () => {
  const [modules, setModules] = useState([]);
  const [editingModule, setEditingModule] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/modules`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setModules(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggleStatus = async (module) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/update-modules/${module.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          moduleName: module.moduleName,
          description: module.description,
          isActive: !module.isActive
        })
      });
      if (response.ok) {
        fetchModules();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{fontSize: '24px', fontWeight: '600'}}>Modules ({modules.length})</h2>
        {!showCreateForm && !editingModule && (
          <button onClick={() => setShowCreateForm(true)} style={{padding: '10px 20px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New Module
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateModuleForm
          onSuccess={() => {
            setShowCreateForm(false);
            fetchModules();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingModule && (
        <UpdateModuleForm
          module={editingModule}
          onSuccess={() => {
            setEditingModule(null);
            fetchModules();
          }}
          onCancel={() => setEditingModule(null)}
        />
      )}

      {!showCreateForm && !editingModule && (
        <div style={{background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f8f9fa', borderBottom: '2px solid #e5e5e5'}}>
                <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666', width: '80px'}}>ID</th>
                <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666', width: '200px'}}>Module Name</th>
                <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666'}}>Description</th>
                <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666', width: '150px'}}>Status</th>
                <th style={{padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666', width: '120px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module,index) => (
                <tr key={module.id} style={{borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{padding: '16px', fontSize: '14px', color: '#333'}}>{index + 1}</td>
                  <td style={{padding: '16px', fontSize: '14px', fontWeight: '600', color: '#000'}}>{module.moduleName}</td>
                  <td style={{padding: '16px', fontSize: '14px', color: '#333', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    <span title={module.description}>{module.description || 'No description'}</span>
                  </td>
                  <td style={{padding: '16px'}}>
                    <label style={{display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '8px'}}>
                      <div style={{position: 'relative', width: '44px', height: '24px', background: module.isActive ? '#4CAF50' : '#ccc', borderRadius: '12px', transition: 'background 0.3s'}}>
                        <input type="checkbox" checked={module.isActive} onChange={() => handleToggleStatus(module)} style={{ display: 'none' }} />
                        <div style={{position: 'absolute', top: '2px', left: module.isActive ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}} />
                      </div>
                      <span style={{fontSize: '12px', fontWeight: '600', color: module.isActive ? '#4CAF50' : '#999'}}>{module.isActive ? 'Active' : 'Inactive'}</span>
                    </label>
                  </td>
                  <td style={{padding: '16px'}}>
                    <button onClick={() => setEditingModule(module)} style={{padding: '8px 16px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showCreateForm && !editingModule && modules.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e5e5'
        }}>
          No modules found. Click "Add New Module" to create one.
        </div>
      )}
    </div>
  );
};

const CreateModuleForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    moduleName: '',
    description: '',
    isActive: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Module created successfully', 'success');
        onSuccess();
      } else {
        showToast('Error: ' + (data.error || 'Failed to create module'), 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to create module', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="enhanced-form" style={{ marginBottom: '20px' }}>
      <div className="form-header">
        <h3>✨ Create New Module</h3>
        <p>Add a new module to the system</p>
      </div>
      <div style={{ background: 'white', padding: '24px' }}>
        <div className="form-grid">
          <div className="form-field">
            <label>Module Name *</label>
            <input
              type="text"
              placeholder="Enter module name"
              value={formData.moduleName}
              onChange={(e) => setFormData({...formData, moduleName: e.target.value})}
              required
            />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select
              value={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="form-field full-width">
            <label>Description</label>
            <textarea
              placeholder="Enter module description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ minHeight: '80px' }}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Create Module</button>
        </div>
      </div>
    </form>
  );
};

const UpdateModuleForm = ({ module, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    moduleName: module.moduleName || '',
    description: module.description || '',
    isActive: module.isActive !== undefined ? module.isActive : true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/update-modules/${module.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Module updated successfully', 'success');
        onSuccess();
      } else {
        showToast('Error: ' + (data.error || 'Failed to update module'), 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to update module', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="enhanced-form edit-form" style={{ marginBottom: '20px' }}>
      <div className="form-header">
        <h3>✏️ Edit Module</h3>
        <p>Update module information</p>
      </div>
      <div style={{ background: 'white', padding: '24px' }}>
        <div className="form-grid">
          <div className="form-field">
            <label>Module Name *</label>
            <input
              type="text"
              placeholder="Enter module name"
              value={formData.moduleName}
              onChange={(e) => setFormData({...formData, moduleName: e.target.value})}
              required
            />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select
              value={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="form-field full-width">
            <label>Description</label>
            <textarea
              placeholder="Enter module description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ minHeight: '80px' }}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Update Module</button>
        </div>
      </div>
    </form>
  );
};

export default ModulesSection;
