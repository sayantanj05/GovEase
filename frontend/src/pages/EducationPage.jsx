import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { educationApi } from '../api/profileApi';
import './EducationPage.css';

const EducationPage = () => {
  const { user } = useAuth();
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState(getEmptyEducation());

  function getEmptyEducation() {
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
      passingYear: '',
      percentageCgpa: '',
      subjects: ''
    };
  }

  useEffect(() => {
    loadEducations();
  }, [user]);

  const loadEducations = async () => {
    if (!user) return;
    try {
      const res = await educationApi.getAll(user._id || user.id);
      if (res.success) {
        setEducations(res.education);
      }
    } catch (err) {
      setMessage('Failed to load education details');
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
      const data = {
        ...formData,
        userId: user._id || user.id,
        passingYear: parseInt(formData.passingYear),
        percentageCgpa: parseFloat(formData.percentageCgpa) || null
      };

      if (editId) {
        await educationApi.update(editId, data);
        setMessage('Education updated successfully!');
      } else {
        await educationApi.create(data);
        setMessage('Education added successfully!');
      }
      setEditing(false);
      setEditId(null);
      setFormData(getEmptyEducation());
      loadEducations();
    } catch (err) {
      setMessage('Failed to save education');
    }
  };

  const handleEdit = (edu) => {
    setEditId(edu._id);
    setFormData(edu);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      await educationApi.delete(id);
      setMessage('Education deleted!');
      loadEducations();
    } catch (err) {
      setMessage('Failed to delete');
    }
  };

  const getFieldsForType = (type) => {
    switch (type) {
      case 'Primary':
      case 'Secondary':
        return (
          <>
            <div className="form-group">
              <label>School Name *</label>
              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Board *</label>
              <input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Passing Year *</label>
              <input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required />
            </div>
            <div className="form-group">
              <label>Percentage/CGPA *</label>
              <input type="number" name="percentageCgpa" value={formData.percentageCgpa} onChange={handleChange} step="0.01" required />
            </div>
          </>
        );
      case 'Higher Secondary':
        return (
          <>
            <div className="form-group">
              <label>School Name *</label>
              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Board *</label>
              <input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Stream *</label>
              <select name="stream" value={formData.stream} onChange={handleChange} required>
                <option value="">Select Stream</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
              </select>
            </div>
            <div className="form-group">
              <label>Passing Year *</label>
              <input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required />
            </div>
            <div className="form-group">
              <label>Percentage/CGPA *</label>
              <input type="number" name="percentageCgpa" value={formData.percentageCgpa} onChange={handleChange} step="0.01" required />
            </div>
          </>
        );
      case 'Under-Graduate':
      case 'Post Graduate':
        return (
          <>
            <div className="form-group">
              <label>Institution *</label>
              <input type="text" name="institution" value={formData.institution} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>University *</label>
              <input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Degree *</label>
              <input type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g., B.Tech, B.Sc" required />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g., Computer Science" />
            </div>
            <div className="form-group">
              <label>Passing Year *</label>
              <input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required />
            </div>
            <div className="form-group">
              <label>CGPA/Percentage *</label>
              <input type="number" name="percentageCgpa" value={formData.percentageCgpa} onChange={handleChange} step="0.01" required />
            </div>
          </>
        );
      case 'Phd':
        return (
          <>
            <div className="form-group">
              <label>University *</label>
              <input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Thesis Title *</label>
              <input type="text" name="thesisTitle" value={formData.thesisTitle || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Supervisor</label>
              <input type="text" name="supervisor" value={formData.supervisor || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Research Area</label>
              <input type="text" name="researchArea" value={formData.researchArea || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Passing Year *</label>
              <input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 10} required />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="education-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="education-container">
      <div className="education-card">
        <div className="card-header">
          <h2>Education Details</h2>
          {!editing && (
            <button className="btn-add" onClick={() => { setEditing(true); setEditId(null); setFormData(getEmptyEducation()); }}>
              + Add Education
            </button>
          )}
        </div>

        {message && <div className="message">{message}</div>}

        {editing ? (
          <form onSubmit={handleSubmit} className="education-form">
            <h3>{editId ? 'Edit Education' : 'Add Education'}</h3>
            <div className="form-group">
              <label>Education Type *</label>
              <select name="educationType" value={formData.educationType} onChange={handleChange} required>
                <option value="">Select Type</option>
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="Higher Secondary">Higher Secondary</option>
                <option value="Under-Graduate">Under-Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="Phd">PhD</option>
              </select>
            </div>
            {formData.educationType && getFieldsForType(formData.educationType)}
            <div className="form-actions">
              <button type="submit" className="btn-save">{editId ? 'Update' : 'Add'}</button>
              <button type="button" className="btn-cancel" onClick={() => { setEditing(false); setEditId(null); }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="education-list">
            {educations.length === 0 ? (
              <div className="empty-state">No education details added yet.</div>
            ) : (
              educations.map(edu => (
                <div key={edu._id} className="education-item">
                  <div className="item-header">
                    <span className="item-type">{edu.educationType}</span>
                    <div className="item-actions">
                      <button className="btn-icon edit" onClick={() => handleEdit(edu)}>Edit</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(edu._id)}>Delete</button>
                    </div>
                  </div>
                  <div className="item-details">
                    {edu.schoolName && <p><strong>School:</strong> {edu.schoolName}</p>}
                    {edu.institution && <p><strong>Institution:</strong> {edu.institution}</p>}
                    {edu.boardUniversity && <p><strong>Board/University:</strong> {edu.boardUniversity}</p>}
                    {edu.stream && <p><strong>Stream:</strong> {edu.stream}</p>}
                    {edu.degree && <p><strong>Degree:</strong> {edu.degree}</p>}
                    {edu.specialization && <p><strong>Specialization:</strong> {edu.specialization}</p>}
                    {edu.thesisTitle && <p><strong>Thesis:</strong> {edu.thesisTitle}</p>}
                    <p><strong>Year:</strong> {edu.passingYear} | <strong>Score:</strong> {edu.percentageCgpa}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationPage;
