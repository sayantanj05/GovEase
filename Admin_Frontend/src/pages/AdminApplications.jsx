import { useEffect, useState } from 'react';
import { adminApi, ApiError } from '../api/adminApi';
import { useToast } from '../components/Toast';
import { formatDateTime } from '../utils/format';

const statusConfig = {
  APPLIED: { label: 'Submitted', color: '#3b82f6', bg: '#eff6ff' },
  UNDER_REVIEW: { label: 'Under Review', color: '#f59e0b', bg: '#fffbeb' },
  APPROVED: { label: 'Approved', color: '#22c55e', bg: '#f0fdf4' },
  REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2' }
};

export default function AdminApplications() {
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ APPLIED: 0, UNDER_REVIEW: 0, APPROVED: 0, REJECTED: 0, total: 0 });
  const [filters, setFilters] = useState({ status: '', targetType: '', q: '' });
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [page, filters.status, filters.targetType, filters.q]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.applications.list({ page, limit: 20, status: filters.status, targetType: filters.targetType, q: filters.q });
      if (data.success) {
        setApplications(data.items || []);
      } else {
        addToast(data.message || 'Failed to load applications', 'error');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        addToast(err.message, 'error');
      } else {
        addToast('Failed to load applications', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminApi.applications.getStats();
      if (data.success) {
        setStats(data.item);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    if (actionLoading === applicationId) return;
    try {
      setActionLoading(applicationId);
      const data = await adminApi.applications.updateStatus(applicationId, newStatus);
      if (data.success) {
        addToast(`Status updated to ${statusConfig[newStatus]?.label}`, 'success');
        fetchApplications();
        fetchStats();
      } else {
        addToast(data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        addToast(err.message, 'error');
      } else {
        addToast('Failed to update status', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      const data = await adminApi.applications.delete(applicationId);
      if (data.success) {
        addToast('Application deleted', 'success');
        fetchApplications();
        fetchStats();
      } else {
        addToast(data.message || 'Failed to delete', 'error');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        addToast(err.message, 'error');
      } else {
        addToast('Failed to delete', 'error');
      }
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(statusConfig).map(([key, val]) => ({ value: key, label: `${val.label} (${stats[key] || 0})` }))
  ];

  const targetTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'exam', label: 'Exams' },
    { value: 'opportunity', label: 'Opportunities' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Applications</h1>
        <p className="page-subtitle">Manage and review submitted applications</p>
      </div>

      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card under_review">
          <div className="stat-value">{stats.UNDER_REVIEW || 0}</div>
          <div className="stat-label">Under Review</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{stats.APPROVED || 0}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{stats.REJECTED || 0}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by user name, email, exam/opportunity..."
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
        />
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select
          className="filter-select"
          value={filters.targetType}
          onChange={(e) => setFilters({ ...filters, targetType: e.target.value, page: 1 })}
        >
          {targetTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No applications found</h3>
              <p>{filters.status || filters.targetType || filters.q ? 'Try adjusting your filters' : 'No applications have been submitted yet'}</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Target</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Reviewed</th>
                      <th style={{ width: '160px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app._id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: 500 }}>{app.user?.fullName || '—'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{app.user?.email || '—'}</div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{app.targetId?.title || app.targetId?.examName || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{app.targetId?.organization || app.targetId?.examBody || '—'}</div>
                        </td>
                        <td>
                          <span className="type-badge">{app.targetType === 'exam' ? 'Exam' : 'Opportunity'}</span>
                        </td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: statusConfig[app.status]?.bg, color: statusConfig[app.status]?.color }}>
                            {statusConfig[app.status]?.icon || '●'} {statusConfig[app.status]?.label}
                          </span>
                        </td>
                        <td>{app.submittedAt ? formatDateTime(app.submittedAt) : '—'}</td>
                        <td>{app.reviewedAt ? formatDateTime(app.reviewedAt) : '—'}</td>
                        <td>
                          <div className="table-actions">
                            <select
                              className="status-select"
                              value={app.status}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              disabled={actionLoading === app._id || ['APPROVED', 'REJECTED'].includes(app.status)}
                            >
                              <option value="APPLIED">Submitted</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="APPROVED">Approve</option>
                              <option value="REJECTED">Reject</option>
                            </select>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDelete(app._id)}
                              disabled={actionLoading === app._id}
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
                <span style={{ padding: '0 0.5rem' }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}