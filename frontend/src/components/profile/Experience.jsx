import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { experienceApi } from '../../api/profileApi';

const Experience = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState(getEmpty());

  function getEmpty() {
    return { userId: user?._id || user?.id || '', organization: '', role: '', employmentStatus: '', startDate: '', endDate: '', currentlyWorking: false, description: '' };
  }

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const res = await experienceApi.getAll(user._id || user.id);
      if (res.success) setExperiences(res.experience);
    } catch (err) { setMessage({ type: 'error', text: 'Failed to load' }); }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const data = { ...formData, userId: user._id || user.id };
      if (editId) { await experienceApi.update(editId, data); setMessage({ type: 'success', text: 'Updated!' }); }
      else { await experienceApi.create(data); setMessage({ type: 'success', text: 'Added!' }); }
      setEditing(false); setEditId(null); setFormData(getEmpty()); loadData();
    } catch (err) { setMessage({ type: 'error', text: 'Failed' }); }
  };

  const handleEdit = (exp) => { setEditId(exp._id); setFormData(exp); setEditing(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; await experienceApi.delete(id); setMessage({ type: 'success', text: 'Deleted!' }); loadData(); };

  if (loading) return <div className="section-loading">Loading...</div>;

  return (
    <div className="experience-section">
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <div className="section-toolbar">
        {!editing && <button className="btn-primary" onClick={() => { setEditing(true); setEditId(null); setFormData(getEmpty()); }}>+ Add Experience</button>}
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-form">
          <h3>{editId ? 'Edit Experience' : 'Add Experience'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Organization *</label><input type="text" name="organization" value={formData.organization} onChange={handleChange} required /></div>
            <div className="form-group"><label>Role *</label><input type="text" name="role" value={formData.role} onChange={handleChange} required /></div>
            <div className="form-group"><label>Employment Status *</label><select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required><option value="">Select</option><option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contract">Contract</option><option value="Internship">Internship</option><option value="Freelance">Freelance</option></select></div>
            <div className="form-group"><label>Start Date *</label><input type="date" name="startDate" value={formData.startDate?.split('T')[0] || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>End Date</label><input type="date" name="endDate" value={formData.endDate?.split('T')[0] || ''} onChange={handleChange} disabled={formData.currentlyWorking} /></div>
            <div className="form-group checkbox"><label><input type="checkbox" name="currentlyWorking" checked={formData.currentlyWorking} onChange={handleChange} /> Currently Working</label></div>
          </div>
          <div className="form-group"><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="3" /></div>
          <div className="form-actions"><button type="submit" className="btn-primary">{editId ? 'Update' : 'Add'}</button><button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button></div>
        </form>
      ) : (
        <div className="timeline-view">
          {experiences.length === 0 ? <div className="empty-state">No experience added yet.</div> : experiences.map(exp => (
            <div key={exp._id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-header"><span className="timeline-type">{exp.role}</span><div className="timeline-actions"><button className="btn-icon edit" onClick={() => handleEdit(exp)}>Edit</button><button className="btn-icon delete" onClick={() => handleDelete(exp._id)}>Delete</button></div></div>
                <p className="org-name">{exp.organization}</p>
                <p className="timeline-year">{new Date(exp.startDate).toLocaleDateString()} - {exp.currentlyWorking ? 'Present' : new Date(exp.endDate).toLocaleDateString()} {exp.durationMonths && `(${exp.durationMonths} months)`}</p>
                {exp.description && <p className="timeline-desc">{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Experience;
