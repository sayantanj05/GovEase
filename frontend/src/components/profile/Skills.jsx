import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { skillApi } from '../../api/profileApi';

const Skills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState(getEmpty());

  function getEmpty() { return { userId: user?._id || user?.id || '', skillType: '', name: '', proficiency: 'Beginner', details: '' }; }

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    try { const res = await skillApi.getAll(user._id || user.id); if (res.success) setSkills(res.skills); } catch (err) { setMessage({ type: 'error', text: 'Failed to load' }); }
    setLoading(false);
  };

  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage({ type: '', text: '' });
    try {
      const data = { ...formData, userId: user._id || user.id };
      if (editId) { await skillApi.update(editId, data); setMessage({ type: 'success', text: 'Updated!' }); }
      else { await skillApi.create(data); setMessage({ type: 'success', text: 'Added!' }); }
      setEditing(false); setEditId(null); setFormData(getEmpty()); loadData();
    } catch (err) { setMessage({ type: 'error', text: 'Failed' }); }
  };

  const handleEdit = (skill) => { setEditId(skill._id); setFormData(skill); setEditing(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; await skillApi.delete(id); setMessage({ type: 'success', text: 'Deleted!' }); loadData(); };

  const proficiencyColor = (p) => { switch (p) { case 'Expert': return '#276749'; case 'Advanced': return '#2b6cb0'; case 'Intermediate': return '#c05621'; default: return '#718096'; } };

  if (loading) return <div className="section-loading">Loading...</div>;

  return (
    <div className="skills-section">
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <div className="section-toolbar">
        {!editing && <button className="btn-primary" onClick={() => { setEditing(true); setEditId(null); setFormData(getEmpty()); }}>+ Add Skill</button>}
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-form">
          <h3>{editId ? 'Edit Skill' : 'Add Skill'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Skill Type *</label><select name="skillType" value={formData.skillType} onChange={handleChange} required><option value="">Select</option><option value="Technical">Technical</option><option value="Soft">Soft</option><option value="Language">Language</option><option value="Certification">Certification</option></select></div>
            <div className="form-group"><label>Skill Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label>Proficiency *</label><select name="proficiency" value={formData.proficiency} onChange={handleChange} required><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option><option value="Expert">Expert</option></select></div>
            <div className="form-group"><label>Details</label><input type="text" name="details" value={formData.details} onChange={handleChange} /></div>
          </div>
          <div className="form-actions"><button type="submit" className="btn-primary">{editId ? 'Update' : 'Add'}</button><button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button></div>
        </form>
      ) : (
        <div className="skills-grid">
          {skills.length === 0 ? <div className="empty-state">No skills added yet.</div> : skills.map(skill => (
            <div key={skill._id} className="skill-card">
              <div className="skill-card-header"><span className="skill-type">{skill.skillType}</span><div className="timeline-actions"><button className="btn-icon edit" onClick={() => handleEdit(skill)}>Edit</button><button className="btn-icon delete" onClick={() => handleDelete(skill._id)}>Delete</button></div></div>
              <p className="skill-name">{skill.name}</p>
              <span className="skill-proficiency" style={{ color: proficiencyColor(skill.proficiency) }}>{skill.proficiency}</span>
              {skill.details && <p className="skill-details">{skill.details}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Skills;
