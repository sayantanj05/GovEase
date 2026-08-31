import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { preferenceApi } from '../../api/profileApi';

const Preferences = () => {
  const { user } = useAuth();
  const [preference, setPreference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({ hobbies: '', interests: '', preferredLanguages: '', locationPreferences: '', opportunityTypePreferences: '', salaryMin: '', salaryMax: '' });

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
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
    } catch (err) { setMessage({ type: 'error', text: 'Failed to load' }); }
    setLoading(false);
  };

  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage({ type: '', text: '' });
    try {
      const data = {
        userId: user._id || user.id,
        hobbies: formData.hobbies.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
        preferredLanguages: formData.preferredLanguages.split(',').map(s => s.trim()).filter(Boolean),
        locationPreferences: formData.locationPreferences.split(',').map(s => s.trim()).filter(Boolean),
        opportunityTypePreferences: formData.opportunityTypePreferences.split(',').map(s => s.trim()).filter(Boolean),
        salaryRange: { min: parseInt(formData.salaryMin) || 0, max: parseInt(formData.salaryMax) || 0 }
      };
      if (preference) { await preferenceApi.update(user._id || user.id, data); setMessage({ type: 'success', text: 'Updated!' }); }
      else { await preferenceApi.create(data); setMessage({ type: 'success', text: 'Saved!' }); }
      setEditing(false); loadData();
    } catch (err) { setMessage({ type: 'error', text: 'Failed' }); }
  };

  if (loading) return <div className="section-loading">Loading...</div>;

  return (
    <div className="preferences-section">
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <div className="section-toolbar">
        {!editing && <button className="btn-primary" onClick={() => setEditing(true)}>{preference ? 'Edit' : 'Add'} Preferences</button>}
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-form">
          <h3>Your Preferences</h3>
          <div className="form-grid">
            <div className="form-group"><label>Hobbies (comma separated)</label><input type="text" name="hobbies" value={formData.hobbies} onChange={handleChange} placeholder="e.g., Reading, Cricket" /></div>
            <div className="form-group"><label>Interests (comma separated)</label><input type="text" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., AI, Web Dev" /></div>
            <div className="form-group"><label>Languages (comma separated)</label><input type="text" name="preferredLanguages" value={formData.preferredLanguages} onChange={handleChange} placeholder="e.g., English, Hindi" /></div>
            <div className="form-group"><label>Locations (comma separated)</label><input type="text" name="locationPreferences" value={formData.locationPreferences} onChange={handleChange} placeholder="e.g., Delhi, Bangalore" /></div>
            <div className="form-group"><label>Opportunity Types</label><input type="text" name="opportunityTypePreferences" value={formData.opportunityTypePreferences} onChange={handleChange} placeholder="e.g., Job, Internship" /></div>
            <div className="form-group"><label>Salary Min (₹)</label><input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} /></div>
            <div className="form-group"><label>Salary Max (₹)</label><input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange} /></div>
          </div>
          <div className="form-actions"><button type="submit" className="btn-primary">Save</button><button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button></div>
        </form>
      ) : preference ? (
        <div className="prefs-view">
          <div className="pref-group"><label>Hobbies</label><div className="tag-list">{preference.hobbies?.map((h, i) => <span key={i} className="tag">{h}</span>)}</div></div>
          <div className="pref-group"><label>Interests</label><div className="tag-list">{preference.interests?.map((h, i) => <span key={i} className="tag">{h}</span>)}</div></div>
          <div className="pref-group"><label>Languages</label><div className="tag-list">{preference.preferredLanguages?.map((h, i) => <span key={i} className="tag">{h}</span>)}</div></div>
          <div className="pref-group"><label>Locations</label><div className="tag-list">{preference.locationPreferences?.map((h, i) => <span key={i} className="tag">{h}</span>)}</div></div>
          <div className="pref-group"><label>Opportunity Types</label><div className="tag-list">{preference.opportunityTypePreferences?.map((h, i) => <span key={i} className="tag">{h}</span>)}</div></div>
          <div className="pref-group"><label>Salary Range</label><p className="salary-text">₹{preference.salaryRange?.min?.toLocaleString()} - ₹{preference.salaryRange?.max?.toLocaleString()}</p></div>
        </div>
      ) : <div className="empty-state">No preferences set.</div>}
    </div>
  );
};

export default Preferences;
