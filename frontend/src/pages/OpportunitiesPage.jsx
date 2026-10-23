import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunitiesApi } from '../api/examsApi';
import { MdBusiness, MdLocationOn, MdWork, MdCalendarToday, MdPerson, MdStar, MdAttachMoney, MdAccessTime, MdArrowForward, MdVerified, MdOutlineWorkOutline } from 'react-icons/md';
import './ExamsPage.css';

const typeBadgeClass = (type) => {
  const map = {
    Job: 'exam-badge-active',
    Internship: 'exam-badge-upcoming',
    Scholarship: 'exam-badge-closed',
    Scheme: 'exam-badge-cancelled',
    Fellowship: 'exam-badge-expired',
    Training: 'exam-badge-closed',
    Exam: 'exam-badge-upcoming',
    Other: 'exam-badge-closed'
  };
  return map[type] || 'exam-badge-closed';
};

const statusBadgeClass = (status) => {
  const map = {
    Active: 'exam-badge-active',
    Closed: 'exam-badge-closed',
    Expired: 'exam-badge-expired',
    Cancelled: 'exam-badge-cancelled',
    Draft: 'exam-badge-upcoming'
  };
  return map[status] || 'exam-badge-closed';
};

const asList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
  if (value && typeof value === 'object') return Object.values(value);
  return [];
};

export default function OpportunitiesPage() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    opportunitiesApi.list({ q: query, opportunityType: typeFilter })
      .then((data) => {
        if (data.success) {
          setOpportunities(data.items || []);
          setError(null);
        } else {
          setError(data.message || 'Failed to load opportunities');
        }
      })
      .catch(() => setError('Failed to load opportunities'))
      .finally(() => setLoading(false));
  }, [query, typeFilter]);

  if (loading) return <div className="loading"><span className="loading-icon"><MdOutlineWorkOutline /></span>Loading opportunities...</div>;

  return (
    <div className="exams-page">
      <h1 className="exams-title">Job Opportunities</h1>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by title or organization..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 340 }}
        />
        <select
          className="form-input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">All types</option>
          {['Job', 'Internship', 'Scholarship', 'Scheme', 'Fellowship', 'Training'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {error && <div style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</div>}

      {opportunities.length === 0 ? (
        <div style={{ color: '#7180ac' }}>No opportunities available right now. Please check back later.</div>
      ) : (
        <div className="exam-grid">
          {opportunities.map((opp) => (
            <div key={opp._id} className="exam-card">
              <div className="exam-card-header">
                <div className="exam-card-title-section">
                  <div className="exam-card-title">{opp.title}</div>
                  <div className="exam-card-subtitle">
                    <MdBusiness className="icon" />
                    {opp.organization}
                  </div>
                </div>
                <span className={`exam-badge ${typeBadgeClass(opp.opportunityType)}`}>{opp.opportunityType}</span>
              </div>

              <div className="exam-card-body">
                {opp.location && (
                  <div className="exam-info-item">
                    <MdLocationOn className="info-icon" />
                    <span>{opp.location}</span>
                  </div>
                )}
                {opp.workModel && (
                  <div className="exam-info-item">
                    <MdWork className="info-icon" />
                    <span>{opp.workModel}</span>
                  </div>
                )}
                {opp.stipend && (
                  <div className="exam-info-item">
                    <MdAttachMoney className="info-icon" />
                    <span>{opp.stipend}</span>
                  </div>
                )}
                {opp.duration && (
                  <div className="exam-info-item">
                    <MdAccessTime className="info-icon" />
                    <span>{opp.duration}</span>
                  </div>
                )}
                {asList(opp.requiredSkills).length > 0 && (
                  <div className="exam-info-item">
                    <MdStar className="info-icon" />
                    <span>{asList(opp.requiredSkills).slice(0, 3).join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="exam-card-meta">
                {opp.applicationDeadline && (
                  <div className="meta-item">
                    <MdCalendarToday className="meta-icon" />
                    <span>Deadline: {new Date(opp.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                )}
                {opp.minAge && opp.maxAge && (
                  <div className="meta-item">
                    <MdPerson className="meta-icon" />
                    <span>Age: {opp.minAge}–{opp.maxAge}</span>
                  </div>
                )}
                {opp.verificationStatus && (
                  <div className="meta-item">
                    <MdVerified className="meta-icon" />
                    <span>{opp.verificationStatus}</span>
                  </div>
                )}
              </div>

              <div className="exam-card-actions">
                <button className="btn btn-secondary" onClick={() => navigate(`/opportunities/${opp._id}`)}>
                  View Details
                </button>
                <button className="btn btn-primary" onClick={() => navigate(`/opportunities/${opp._id}/apply`)}>
                  Apply Now <MdArrowForward className="btn-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
