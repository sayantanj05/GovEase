import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';

const PersonalInfo = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({});
  const [addressData, setAddressData] = useState({});

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const res = await profileApi.get(user._id || user.id);
      if (res.success) {
        setProfile(res.profile);
        setAddress(res.address);
        setFormData(res.profile || {});
        setAddressData(res.address || {});
        if (!res.profile) setEditing(true);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
    setLoading(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      if (profile) {
        await profileApi.update(user._id || user.id, formData);
      } else {
        await profileApi.create({ ...formData, userId: user._id || user.id });
      }
      if (address) {
        await profileApi.updateAddress(user._id || user.id, addressData);
      } else {
        await profileApi.createAddress({ ...addressData, userId: user._id || user.id });
      }
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      setEditing(false);
      loadProfile();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save profile' });
    }
  };

  if (loading) return <div className="section-loading">Loading...</div>;

  return (
    <div className="personal-info">
      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="section-toolbar">
        {!editing && (
          <button className="btn-primary" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {!editing ? (
        <div className="profile-view">
          <div className="info-grid">
            <div className="info-item">
              <label>User ID</label>
              <span className="user-id">{user?._id || user?.id}</span>
            </div>
            <div className="info-item">
              <label>Father's Name</label>
              <span>{profile?.fatherName || '-'}</span>
            </div>
            <div className="info-item">
              <label>Mother's Name</label>
              <span>{profile?.motherName || '-'}</span>
            </div>
            <div className="info-item">
              <label>Date of Birth</label>
              <span>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}</span>
            </div>
            <div className="info-item">
              <label>Age</label>
              <span>{profile?.age ? `${profile.age} years` : '-'}</span>
            </div>
            <div className="info-item">
              <label>Gender</label>
              <span>{profile?.gender || '-'}</span>
            </div>
            <div className="info-item">
              <label>Blood Group</label>
              <span>{profile?.bloodGroup || '-'}</span>
            </div>
            <div className="info-item">
              <label>Profession</label>
              <span>{profile?.profession || '-'}</span>
            </div>
            <div className="info-item">
              <label>Category</label>
              <span>{profile?.category || '-'}</span>
            </div>
            <div className="info-item">
              <label>Annual Income</label>
              <span>{profile?.income ? `₹${profile.income.toLocaleString()}` : '-'}</span>
            </div>
            <div className="info-item">
              <label>Disability</label>
              <span>{profile?.disability?.hasDisability ? `${profile.disability.type} (${profile.disability.percentage}%)` : 'None'}</span>
            </div>
          </div>

          {address && (
            <div className="address-section">
              <h3>Address</h3>
              <div className="info-grid">
                <div className="info-item"><label>Village/Town</label><span>{address.villageTown}</span></div>
                <div className="info-item"><label>City</label><span>{address.city}</span></div>
                <div className="info-item"><label>State</label><span>{address.state}</span></div>
                <div className="info-item"><label>Pin Code</label><span>{address.pinCode}</span></div>
                <div className="info-item"><label>Country</label><span>{address.country}</span></div>
              </div>
            </div>
          )}

          {profile && (
            <div className="completeness-bar">
              <label>Profile Completeness: {profile.completenessScore || 0}%</label>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${profile.completenessScore || 0}%` }}></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <h3>Personal Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Father's Name *</label>
              <input type="text" name="fatherName" value={formData.fatherName || ''} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label>Mother's Name *</label>
              <input type="text" name="motherName" value={formData.motherName || ''} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth?.split('T')[0] || ''} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender || ''} onChange={handleProfileChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleProfileChange}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Profession *</label>
              <input type="text" name="profession" value={formData.profession || ''} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category || ''} onChange={handleProfileChange} required>
                <option value="">Select Category</option>
                {['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Annual Income (₹) *</label>
              <input type="number" name="income" value={formData.income || ''} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label>Disability</label>
              <select
                name="disability.hasDisability"
                value={formData.disability?.hasDisability || false}
                onChange={(e) => setFormData(prev => ({ ...prev, disability: { ...prev.disability, hasDisability: e.target.value === 'true' } }))}
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>
            {formData.disability?.hasDisability && (
              <>
                <div className="form-group">
                  <label>Disability Type</label>
                  <input type="text" name="disability.type" value={formData.disability?.type || ''} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label>Percentage</label>
                  <input type="number" name="disability.percentage" value={formData.disability?.percentage || ''} onChange={handleProfileChange} min="0" max="100" />
                </div>
              </>
            )}
          </div>

          <h3>Address</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Village/Town</label>
              <input type="text" name="villageTown" value={addressData.villageTown || ''} onChange={handleAddressChange} />
            </div>
            <div className="form-group">
              <label>City *</label>
              <input type="text" name="city" value={addressData.city || ''} onChange={handleAddressChange} required />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input type="text" name="state" value={addressData.state || ''} onChange={handleAddressChange} required />
            </div>
            <div className="form-group">
              <label>Pin Code *</label>
              <input type="text" name="pinCode" value={addressData.pinCode || ''} onChange={handleAddressChange} pattern="\d{6}" required />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input type="text" name="country" value={addressData.country || 'India'} onChange={handleAddressChange} readOnly />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Save Profile</button>
            <button type="button" className="btn-secondary" onClick={() => { setEditing(false); loadProfile(); }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PersonalInfo;
