import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { experienceApi } from '../api/profileApi';
import './ExperiencePage.css';

const ExperiencePage = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState(getEmptyExperience());

  function getEmptyExperience() {
    return {
      userId: user?._id || user?.id || '',
      organization: '',
      role: '',
      employmentStatus: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: ''
    };
  }

  useEffect(() => {
    loadExperiences();
  }, [user]);

  const loadExperiences = async () => {
    if (!user) return;
    try {
      const res = await experienceApi.getAll(user._id || user.id);
      if (res.success) setExperiences(res.experience);
    } catch (err) {
      setMessage('Failed to load experience');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const data = { ...formData, userId: user._id || user.id };
      if (editId) {
        await experienceApi.update(editId, data);
        setMessage('Experience updated!');
      } else {
        await experienceApi.create(data);
        setMessage('Experience added!');
      }
      setEditing(false);
      setEditId(null);
      setFormData(getEmptyExperience());
      loadExperiences();
    } catch (err) {
      setMessage('Failed to save');
    }
  };

  const handleEdit = (exp) => {
    setEditId(exp._id);
    setFormData(exp);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience?')) return;
    await experienceApi.delete(id);
    setMessage('Deleted!');
    loadExperiences();
  };

  if (loading) return <div className="experience-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="experience-container">
      <div className="experience-card">
        <div className="card-header">
          <h2>Experience</h2>
          {!editing && (
            <button className="btn-add" onClick={() => { setEditing(true); setEditId(null); setFormData(getEmptyExperience()); }}>
              + Add Experience
            </button>
          )}
        </div>

        {message && <div className="message">{message}</div>}

        {editing ? (
          <form onSubmit={handleSubmit} className="experience-form">
            <h3>{editId ? 'Edit Experience' : 'Add Experience'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Organization *</label>
                <input type="text" name="organization" value={formData.organization} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <input type="text" name="role" value={formData.role} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Employment Status *</label>
                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input type="date" name="startDate" value={formData.startDate?.split('T')[0] || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="endDate" value={formData.endDate?.split('T')[0] || ''} onChange={handleChange} disabled={formData.currentlyWorking} />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="currentlyWorking" checked={formData.currentlyWorking} onChange={handleChange} />
                  Currently Working
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Describe your role and achievements" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">{editId ? 'Update' : 'Add'}</button>
              <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="experience-list">
            {experiences.length === 0 ? (
              <div className="empty-state">No experience added yet.</div>
            ) : (
              experiences.map(exp => (
                <div key={exp._id} className="experience-item">
                  <div className="item-header">
                    <span className="item-role">{exp.role}</span>
                    <div className="item-actions">
                      <button className="btn-icon edit" onClick={() => handleEdit(exp)}>Edit</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(exp._id)}>Delete</button>
                    </div>
                  </div>
                  <p className="org-name">{exp.organization}</p>
                  <p className="exp-dates">
                    {new Date(exp.startDate).toLocaleDateString()} - {exp.currentlyWorking ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                    {exp.durationMonths && <span className="duration"> ({exp.durationMonths} months)</span>}
                  </p>
                  {exp.description && <p className="exp-desc">{exp.description}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperiencePage;
