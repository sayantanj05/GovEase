import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { skillApi } from '../api/profileApi';
import './SkillsPage.css';

const SkillsPage = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ userId: '', skillType: '', name: '', proficiency: 'Beginner', details: '' });

  useEffect(() => {
    loadSkills();
  }, [user]);

  const loadSkills = async () => {
    if (!user) return;
    try {
      const res = await skillApi.getAll(user._id || user.id);
      if (res.success) setSkills(res.skills);
    } catch (err) {
      setMessage('Failed to load skills');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const data = { ...formData, userId: user._id || user.id };
      if (editId) {
        await skillApi.update(editId, data);
        setMessage('Skill updated!');
      } else {
        await skillApi.create(data);
        setMessage('Skill added!');
      }
      setEditing(false);
      setEditId(null);
      setFormData({ userId: '', skillType: '', name: '', proficiency: 'Beginner', details: '' });
      loadSkills();
    } catch (err) {
      setMessage('Failed to save');
    }
  };

  const handleEdit = (skill) => {
    setEditId(skill._id);
    setFormData(skill);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    await skillApi.delete(id);
    setMessage('Deleted!');
    loadSkills();
  };

  const getSkillColor = (proficiency) => {
    switch (proficiency) {
      case 'Expert': return '#276749';
      case 'Advanced': return '#2b6cb0';
      case 'Intermediate': return '#c05621';
      default: return '#718096';
    }
  };

  if (loading) return <div className="skills-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="skills-container">
      <div className="skills-card">
        <div className="card-header">
          <h2>Skills</h2>
          {!editing && (
            <button className="btn-add" onClick={() => { setEditing(true); setEditId(null); setFormData({ userId: '', skillType: '', name: '', proficiency: 'Beginner', details: '' }); }}>
              + Add Skill
            </button>
          )}
        </div>

        {message && <div className="message">{message}</div>}

        {editing ? (
          <form onSubmit={handleSubmit} className="skills-form">
            <h3>{editId ? 'Edit Skill' : 'Add Skill'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Skill Type *</label>
                <select name="skillType" value={formData.skillType} onChange={handleChange} required>
                  <option value="">Select Type</option>
                  <option value="Technical">Technical</option>
                  <option value="Soft">Soft</option>
                  <option value="Language">Language</option>
                  <option value="Certification">Certification</option>
                </select>
              </div>
              <div className="form-group">
                <label>Skill Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Proficiency *</label>
                <select name="proficiency" value={formData.proficiency} onChange={handleChange} required>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="form-group">
                <label>Details</label>
                <input type="text" name="details" value={formData.details} onChange={handleChange} placeholder="e.g., React, Node.js" />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">{editId ? 'Update' : 'Add'}</button>
              <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="skills-grid">
            {skills.length === 0 ? (
              <div className="empty-state">No skills added yet.</div>
            ) : (
              skills.map(skill => (
                <div key={skill._id} className="skill-card">
                  <div className="skill-header">
                    <span className="skill-type">{skill.skillType}</span>
                    <div className="item-actions">
                      <button className="btn-icon edit" onClick={() => handleEdit(skill)}>Edit</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(skill._id)}>Delete</button>
                    </div>
                  </div>
                  <p className="skill-name">{skill.name}</p>
                  <span className="skill-proficiency" style={{ color: getSkillColor(skill.proficiency) }}>
                    {skill.proficiency}
                  </span>
                  {skill.details && <p className="skill-details">{skill.details}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsPage;
