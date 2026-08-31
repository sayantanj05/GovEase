import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { identityApi } from '../api/profileApi';
import './IdentityPage.css';

const IdentityPage = () => {
  const { user } = useAuth();
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ idType: 'Aadhaar', idNumber: '' });

  useEffect(() => {
    loadIdentity();
  }, [user]);

  const loadIdentity = async () => {
    if (!user) return;
    try {
      const res = await identityApi.get(user._id || user.id);
      if (res.success) setIdentity(res.identity);
    } catch (err) {
      setMessage('Failed to load identity');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const data = { userId: user._id || user.id, ids: [{ ...formData, verified: false }] };
      if (identity) {
        await identityApi.addId(user._id || user.id, formData);
        setMessage('ID added!');
      } else {
        await identityApi.create(data);
        setMessage('ID created!');
      }
      setEditing(false);
      setFormData({ idType: 'Aadhaar', idNumber: '' });
      loadIdentity();
    } catch (err) {
      setMessage('Failed to add ID');
    }
  };

  const handleRemove = async (idType) => {
    if (!window.confirm(`Remove ${idType}?`)) return;
    await identityApi.removeId(user._id || user.id, idType);
    setMessage('Removed!');
    loadIdentity();
  };

  const needsImage = !['ABC ID'].includes(formData.idType);

  if (loading) return <div className="identity-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="identity-container">
      <div className="identity-card">
        <div className="card-header">
          <h2>Government IDs</h2>
          {!editing && (
            <button className="btn-add" onClick={() => setEditing(true)}>+ Add ID</button>
          )}
        </div>

        {message && <div className="message">{message}</div>}

        {editing ? (
          <form onSubmit={handleAdd} className="identity-form">
            <h3>Add Government ID</h3>
            <div className="form-group">
              <label>ID Type *</label>
              <select name="idType" value={formData.idType} onChange={handleChange} required>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Voter Card">Voter ID Card</option>
                <option value="Driving License">Driving License</option>
                <option value="ABC ID">ABC ID</option>
              </select>
            </div>
            <div className="form-group">
              <label>ID Number *</label>
              <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="Enter ID number" required />
            </div>
            {needsImage && (
              <div className="form-group">
                <label>Upload ID Image {needsImage && '*'}</label>
                <input type="file" accept="image/jpeg,image/png,application/pdf" />
                <small>JPEG, PNG or PDF (Max 5MB)</small>
              </div>
            )}
            <p className="note">{formData.idType === 'ABC ID' ? '* ABC ID does not require image' : '* Image required for verification'}</p>
            <div className="form-actions">
              <button type="submit" className="btn-save">Add ID</button>
              <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="identity-list">
            {identity && identity.ids?.length > 0 ? (
              identity.ids.map((id, idx) => (
                <div key={idx} className="identity-item">
                  <div className="item-info">
                    <span className="id-type">{id.idType}</span>
                    <span className="id-number">{id.idNumber}</span>
                    <span className={`id-status ${id.verified ? 'verified' : 'unverified'}`}>
                      {id.verified ? 'Verified' : 'Unverified'}
                    </span>
                    {!id.imageFileId && <span className="no-image">No Image</span>}
                  </div>
                  <button className="btn-remove" onClick={() => handleRemove(id.idType)}>Remove</button>
                </div>
              ))
            ) : (
              <div className="empty-state">No government IDs added yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityPage;
