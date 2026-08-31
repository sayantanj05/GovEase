import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { preferenceApi } from '../api/profileApi';
import './PreferencesPage.css';

const PreferencesPage = () => {
  const { user } = useAuth();
  const [preference, setPreference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    hobbies: '',
    interests: '',
    preferredLanguages: '',
    locationPreferences: '',
    opportunityTypePreferences: '',
    salaryMin: '',
    salaryMax: ''
  });

  useEffect(() => {
    loadPreference();
  }, [user]);

  const loadPreference = async () => {
    if (!user) return;
    try {
      const res = await preferenceApi.get(user._id || user.id);
      if (res.success) {
        setPreference(res.preference);
        setFormData({
          hobbies: res.preference.hobbies?.join(', ') || '',
          interests: res.preference.interests?.join(', ') || '',
          preferredLanguages: res.preference.preferredLanguages?.join(', ') || '',
          locationPreferences: res.preference.locationPreferences?.join(', ') || '',
          opportunityTypePreferences: res.preference.opportunityTypePreferences?.join(', ') || '',
          salaryMin: res.preference.salaryRange?.min || '',
          salaryMax: res.preference.salaryRange?.max || ''
        });
      }
    } catch (err) {
      setMessage('Failed to load preferences');
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
        userId: user._id || user.id,
        hobbies: formData.hobbies.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
        preferredLanguages: formData.preferredLanguages.split(',').map(s => s.trim()).filter(Boolean),
        locationPreferences: formData.locationPreferences.split(',').map(s => s.trim()).filter(Boolean),
        opportunityTypePreferences: formData.opportunityTypePreferences.split(',').map(s => s.trim()).filter(Boolean),
        salaryRange: {
          min: parseInt(formData.salaryMin) || 0,
          max: parseInt(formData.salaryMax) || 0
        }
      };

      if (preference) {
        await preferenceApi.update(user._id || user.id, data);
        setMessage('Preferences updated!');
      } else {
        await preferenceApi.create(data);
        setMessage('Preferences saved!');
      }
      setEditing(false);
      loadPreference();
    } catch (err) {
      setMessage('Failed to save');
    }
  };

  if (loading) return <div className="preferences-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="preferences-container">
      <div className="preferences-card">
        <div className="card-header">
          <h2>My Preferences</h2>
          {!editing && (
            <button className="btn-edit-toggle" onClick={() => setEditing(true)}>
              {preference ? 'Edit' : 'Add Preferences'}
            </button>
          )}
        </div>

        {message && <div className="message">{message}</div>}

        {editing ? (
          <form onSubmit={handleSubmit} className="preferences-form">
            <div className="form-group">
              <label>Hobbies (comma separated)</label>
              <input type="text" name="hobbies" value={formData.hobbies} onChange={handleChange} placeholder="e.g., Reading, Cricket, Coding" />
            </div>
            <div className="form-group">
              <label>Interests (comma separated)</label>
              <input type="text" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., AI, Web Development" />
            </div>
            <div className="form-group">
              <label>Preferred Languages (comma separated)</label>
              <input type="text" name="preferredLanguages" value={formData.preferredLanguages} onChange={handleChange} placeholder="e.g., English, Hindi" />
            </div>
            <div className="form-group">
              <label>Location Preferences (comma separated)</label>
              <input type="text" name="locationPreferences" value={formData.locationPreferences} onChange={handleChange} placeholder="e.g., Delhi, Bangalore" />
            </div>
            <div className="form-group">
              <label>Opportunity Type Preferences (comma separated)</label>
              <input type="text" name="opportunityTypePreferences" value={formData.opportunityTypePreferences} onChange={handleChange} placeholder="e.g., Job, Scheme, Internship" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Salary Range Min (₹)</label>
                <input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} placeholder="e.g., 500000" />
              </div>
              <div className="form-group">
                <label>Salary Range Max (₹)</label>
                <input type="text" name="salaryMax" value={formData.salaryMax} onChange={handleChange} placeholder="e.g., 1500000" />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">Save Preferences</button>
              <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : preference ? (
          <div className="preferences-view">
            <div className="pref-section">
              <h3>Hobbies</h3>
              <div className="tag-list">
                {preference.hobbies?.map((h, i) => <span key={i} className="tag">{h}</span>)}
              </div>
            </div>
            <div className="pref-section">
              <h3>Interests</h3>
              <div className="tag-list">
                {preference.interests?.map((h, i) => <span key={i} className="tag">{h}</span>)}
              </div>
            </div>
            <div className="pref-section">
              <h3>Preferred Languages</h3>
              <div className="tag-list">
                {preference.preferredLanguages?.map((h, i) => <span key={i} className="tag">{h}</span>)}
              </div>
            </div>
            <div className="pref-section">
              <h3>Preferred Locations</h3>
              <div className="tag-list">
                {preference.locationPreferences?.map((h, i) => <span key={i} className="tag">{h}</span>)}
              </div>
            </div>
            <div className="pref-section">
              <h3>Opportunity Types</h3>
              <div className="tag-list">
                {preference.opportunityTypePreferences?.map((h, i) => <span key={i} className="tag">{h}</span>)}
              </div>
            </div>
            <div className="pref-section">
              <h3>Expected Salary Range</h3>
              <p className="salary-range">₹{preference.salaryRange?.min?.toLocaleString()} - ₹{preference.salaryRange?.max?.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="empty-state">No preferences set. Click to add your preferences.</div>
        )}
      </div>
    </div>
  );
};

export default PreferencesPage;
