import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { educationApi } from '../../api/profileApi';
import './Education.css';

const educationTypes = ['Primary', 'Secondary', 'Higher Secondary', 'Under-Graduate', 'Post Graduate', 'Phd'];

const Education = () => {
  const { user } = useAuth();
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      userId: user?._id || user?.id || '',
      educationType: '',
      schoolName: '',
      boardUniversity: '',
      stream: '',
      degree: '',
      specialization: '',
      course: '',
      institution: '',
      thesisTitle: '',
      supervisor: '',
      researchArea: '',
      passingYear: '',
      percentageCgpa: ''
    };
  }

  useEffect(() => { loadEducations(); }, [user]);

  const loadEducations = async () => {
    if (!user) return;
    try {
      const res = await educationApi.getAll(user._id || user.id);
      if (res.success) setEducations(res.education);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load education' });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const data = {
        ...formData,
        userId: user._id || user.id,
        passingYear: parseInt(formData.passingYear),
        percentageCgpa: parseFloat(formData.percentageCgpa) || null
      };
      if (editId) {
        await educationApi.update(editId, data);
        setMessage({ type: 'success', text: 'Education updated!' });
      } else {
        await educationApi.create(data);
        setMessage({ type: 'success', text: 'Education added!' });
      }
      setEditing(false);
      setEditId(null);
      setFormData(getEmptyForm());
      loadEducations();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save' });
    }
  };

  const handleEdit = (edu) => {
    setEditId(edu._id);
    setFormData(edu);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    await educationApi.delete(id);
    setMessage({ type: 'success', text: 'Deleted!' });
    loadEducations();
  };

  const renderFields = () => {
    const type = formData.educationType;
    if (!type) return null;

    const fields = {
      Primary: (
        <>
          <div className="form-group"><label>School Name *</label><input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required /></div>
          <div className="form-group"><label>Board *</label><input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required /></div>
          <div className="form-group"><label>Passing Year *</label><input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required /></div>
          <div className="form-group"><label>Percentage *</label><input type="number" name="percentageCgpa" value={formData.percentageCgpa} onChange={handleChange} step="0.01" required /></div>
        </>
      ),
      Secondary: (
        <>
          <div className="form-group"><label>School Name *</label><input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required /></div>
          <div className="form-group"><label>Board *</label><input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required /></div>
          <div className="form-group"><label>Passing Year *</label><input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required /></div>
          <div className="form-group"><label>Percentage *</label><input type="number" name="percentageCgpa" value={formData.percentageCgpa} onChange={handleChange} step="0.01" required /></div>
        </>
      ),
      'Higher Secondary': (
        <>
          <div className="form-group"><label>School Name *</label><input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required /></div>
          <div className="form-group"><label>Board *</label><input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required /></div>
          <div className="form-group"><label>Stream *</label><select name="stream" value={formData.stream} onChange={handleChange} required><option value="">Select</option><option value="Science">Science</option><option value="Commerce">Commerce</option><option value="Arts">Arts</option></select></div>
          <div className="form-group"><label>Passing Year *</label><input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required /></div>
          <div className="form-group"><label>Percentage *</label><input type="number" name="percentageCgpa" value={formData.percentageCgpa} onChange={handleChange} step="0.01" required /></div>
        </>
      ),
      'Under-Graduate': (
        <>
          <div className="form-group"><label>Institution *</label><input type="text" name="institution" value={formData.institution} onChange={handleChange} required /></div>
          <div className="form-group"><label>University *</label><input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required /></div>
          <div className="form-group"><label>Degree *</label><input type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g., B.Tech" required /></div>
          <div className="form-group"><label>Specialization</label><input type="text" name="specialization" value={formData.specialization} onChange={handleChange} /></div>
          <div className="form-group"><label>Passing Year *</label><input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required /></div>
          <div className="form-group"><label>CGPA/Percentage *</label><input type="number" name="percentageCgpa" value={formData.percentageCgpa} onChange={handleChange} step="0.01" required /></div>
        </>
      ),
      'Post Graduate': (
        <>
          <div className="form-group"><label>Institution *</label><input type="text" name="institution" value={formData.institution} onChange={handleChange} required /></div>
          <div className="form-group"><label>University *</label><input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required /></div>
          <div className="form-group"><label>Degree *</label><input type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g., M.Tech, MBA" required /></div>
          <div className="form-group"><label>Specialization</label><input type="text" name="specialization" value={formData.specialization} onChange={handleChange} /></div>
          <div className="form-group"><label>Passing Year *</label><input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required /></div>
          <div className="form-group"><label>CGPA/Percentage *</label><input type="number" name="percentageCgpa" value={formData.percentageCgpa} onChange={handleChange} step="0.01" required /></div>
        </>
      ),
      Phd: (
        <>
          <div className="form-group"><label>University *</label><input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required /></div>
          <div className="form-group"><label>Thesis Title *</label><input type="text" name="thesisTitle" value={formData.thesisTitle} onChange={handleChange} required /></div>
          <div className="form-group"><label>Supervisor</label><input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} /></div>
          <div className="form-group"><label>Research Area</label><input type="text" name="researchArea" value={formData.researchArea} onChange={handleChange} /></div>
          <div className="form-group"><label>Passing Year *</label><input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required /></div>
        </>
      )
    };
    return fields[type];
  };

  if (loading) return <div className="section-loading">Loading...</div>;

  return (
    <div className="education-section">
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="section-toolbar">
        {!editing && (
          <button className="btn-primary" onClick={() => { setEditing(true); setEditId(null); setFormData(getEmptyForm()); }}>
            + Add Education
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="section-form">
          <h3>{editId ? 'Edit Education' : 'Add Education'}</h3>
          <div className="form-group">
            <label>Education Type *</label>
            <select name="educationType" value={formData.educationType} onChange={handleChange} required>
              <option value="">Select Type</option>
              {educationTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-grid">{renderFields()}</div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Add'}</button>
            <button type="button" className="btn-secondary" onClick={() => { setEditing(false); setEditId(null); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="timeline-view">
          {educations.length === 0 ? (
            <div className="empty-state">No education details added yet.</div>
          ) : (
            educations.map(edu => (
              <div key={edu._id} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-type">{edu.educationType}</span>
                    <div className="timeline-actions">
                      <button className="btn-icon edit" onClick={() => handleEdit(edu)}>Edit</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(edu._id)}>Delete</button>
                    </div>
                  </div>
                  <div className="timeline-details">
                    {edu.schoolName && <p><strong>School:</strong> {edu.schoolName}</p>}
                    {edu.institution && <p><strong>Institution:</strong> {edu.institution}</p>}
                    {edu.boardUniversity && <p><strong>Board/University:</strong> {edu.boardUniversity}</p>}
                    {edu.stream && <p><strong>Stream:</strong> {edu.stream}</p>}
                    {edu.degree && <p><strong>Degree:</strong> {edu.degree}</p>}
                    {edu.specialization && <p><strong>Specialization:</strong> {edu.specialization}</p>}
                    {edu.thesisTitle && <p><strong>Thesis:</strong> {edu.thesisTitle}</p>}
                    <p className="timeline-year"><strong>{edu.passingYear}</strong> - {edu.percentageCgpa && <span>Score: {edu.percentageCgpa}</span>}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Education;
