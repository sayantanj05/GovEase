import { useEffect, useState } from 'react';
import { applicationsApi } from '../api/examsApi';
import { useAuth } from '../context/AuthContext';
import { MdAssignment, MdSearch, MdCheckCircle, MdCancel, MdCalendarToday, MdSchool, MdBusiness, MdAccessTime, MdDescription, MdLocationOn, MdTrendingUp } from 'react-icons/md';
import './ApplicationsPage.css';

const statusConfig = {
  APPLIED: { label: 'Submitted', color: '#3b82f6', icon: <MdAssignment />, order: 1 },
  UNDER_REVIEW: { label: 'Under Review', color: '#f59e0b', icon: <MdSearch />, order: 2 },
  APPROVED: { label: 'Decision', color: '#6366f1', icon: <MdAssignment />, order: 3 },
  REJECTED: { label: 'Decision', color: '#6366f1', icon: <MdAssignment />, order: 3 }
};

// For display purposes - shows the actual decision (Approved/Rejected) when finalized
const displayStatusConfig = {
  APPLIED: { label: 'Submitted', color: '#3b82f6', icon: <MdAssignment />, order: 1 },
  UNDER_REVIEW: { label: 'Under Review', color: '#f59e0b', icon: <MdSearch />, order: 2 },
  APPROVED: { label: 'Approved', color: '#22c55e', icon: <MdCheckCircle />, order: 3 },
  REJECTED: { label: 'Rejected', color: '#ef4444', icon: <MdCancel />, order: 3 }
};

// Timeline shows 3 steps: Submitted, Under Review, Decision
const timelineOrder = ['APPLIED', 'UNDER_REVIEW', 'APPROVED'];
const statusOrder = ['APPLIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

export default function ApplicationsPage() {
  const { isAuthenticated, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchApplications();
  }, [isAuthenticated]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.list();
      if (res.success) {
        setApplications(res.items || []);
      } else {
        setError(res.message || 'Failed to load applications');
      }
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getTargetTitle = (app) => {
    if (app.targetId?.title) return app.targetId.title;
    if (app.targetId?.examName) return app.targetId.examName;
    if (app.targetId?.organization) return `${app.targetId.organization} - ${app.targetId.title || 'Opportunity'}`;
    return app.targetType === 'exam' ? 'Exam Application' : 'Opportunity Application';
  };

  const getTargetMeta = (app) => {
    if (app.targetType === 'exam') {
      return app.targetId?.examBody ? `Conducted by: ${app.targetId.examBody}` : 'Exam';
    }
    return app.targetId?.organization ? `Organization: ${app.targetId.organization}` : 'Opportunity';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['APPLIED', 'UNDER_REVIEW'].includes(app.status);
    if (activeTab === 'completed') return ['APPROVED', 'REJECTED'].includes(app.status);
    if (activeTab === 'APPROVED') return ['APPROVED', 'REJECTED'].includes(app.status);
    return app.status === activeTab;
  });

  if (!isAuthenticated) {
    return <div className="applications-page"><p>Please log in to view your applications.</p></div>;
  }

  return (
    <div className="applications-page">
      <div className="page-header">
        <h1>My Applications</h1>
        <p className="page-subtitle">Track the status of your exam and opportunity applications</p>
      </div>

      <div className="tab-bar">
        <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All ({applications.length})
        </button>
        <button className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          Active ({applications.filter(a => ['APPLIED', 'UNDER_REVIEW'].includes(a.status)).length})
        </button>
        <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          Completed ({applications.filter(a => ['APPROVED', 'REJECTED'].includes(a.status)).length})
        </button>
        {statusOrder.slice(1, 3).map(s => (
          <button key={s} className={`tab ${activeTab === s ? 'active' : ''}`} onClick={() => setActiveTab(s)}>
            {statusConfig[s].label} ({applications.filter(a => a.status === s).length})
          </button>
        ))}
        <button className={`tab ${activeTab === 'APPROVED' || activeTab === 'REJECTED' ? 'active' : ''}`} onClick={() => setActiveTab('APPROVED')}>
          Decision ({applications.filter(a => ['APPROVED', 'REJECTED'].includes(a.status)).length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">
          <span className="loading-icon"><MdAssignment /></span>
          Loading applications...
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><span className="empty-icon-inner"><MdAssignment /></span></div>
          <h3>No applications found</h3>
          <p>{activeTab !== 'all' ? `No applications with status "${activeTab === 'APPROVED' ? 'Decision' : statusConfig[activeTab]?.label || activeTab}"` : 'You haven\'t applied for any exams or opportunities yet.'}</p>
          <div className="empty-actions">
            <a href="/exams" className="btn btn-primary">Browse Exams</a>
            <a href="/opportunities" className="btn btn-secondary">Browse Opportunities</a>
          </div>
        </div>
      ) : (
        <div className="applications-list">
          {filteredApplications.map((app, index) => (
            <ApplicationTimelineCard
              key={app._id}
              app={app}
              index={index}
              getTargetTitle={getTargetTitle}
              getTargetMeta={getTargetMeta}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationTimelineCard({ app, getTargetTitle, getTargetMeta, formatDate }) {
  const currentStatus = app.status;
  const currentOrder = statusConfig[currentStatus]?.order || 1;

  // Get display values for status badge (shows Approved/Rejected when decision is made)
  const getStatusBadgeLabel = () => {
    if (currentStatus === 'APPROVED') {
      return 'Approved';
    }
    if (currentStatus === 'REJECTED') {
      return 'Rejected';
    }
    if (currentStatus === 'UNDER_REVIEW') {
      return 'Under Review';
    }
    return statusConfig[currentStatus]?.label || currentStatus;
  };

  const getStatusBadgeColor = () => {
    if (currentStatus === 'APPROVED') {
      return '#22c55e';
    }
    if (currentStatus === 'REJECTED') {
      return '#ef4444';
    }
    return statusConfig[currentStatus]?.color || '#6366f1';
  };

  const getStatusBadgeIcon = () => {
    if (currentStatus === 'APPROVED') {
      return <MdCheckCircle />;
    }
    if (currentStatus === 'REJECTED') {
      return <MdCancel />;
    }
    return statusConfig[currentStatus]?.icon || <MdAssignment />;
  };

  // For timeline - get display values for the Decision step
  const getTimelineDecisionLabel = () => {
    if (currentStatus === 'APPROVED') {
      return 'Approved';
    }
    if (currentStatus === 'REJECTED') {
      return 'Rejected';
    }
    return 'Decision';
  };

  const getTimelineDecisionColor = () => {
    if (currentStatus === 'APPROVED') {
      return '#22c55e';
    }
    if (currentStatus === 'REJECTED') {
      return '#ef4444';
    }
    return '#6366f1';
  };

  const getTimelineDecisionIcon = () => {
    if (currentStatus === 'APPROVED') {
      return <MdCheckCircle />;
    }
    if (currentStatus === 'REJECTED') {
      return <MdCancel />;
    }
    return <MdAssignment />;
  };

  const getExamDetails = () => {
    const target = app.targetId;
    if (!target) return [];
    
    const details = [];
    if (target.examCategory) {
      details.push({ icon: <MdDescription />, label: target.examCategory });
    }
    if (target.examMode) {
      details.push({ icon: <MdAccessTime />, label: target.examMode });
    }
    if (target.durationMinutes) {
      details.push({ icon: <MdAccessTime />, label: `${target.durationMinutes} min` });
    }
    if (target.examDate) {
      details.push({ icon: <MdCalendarToday />, label: new Date(target.examDate).toLocaleDateString() });
    }
    if (target.venue) {
      details.push({ icon: <MdLocationOn />, label: target.venue });
    }
    if (target.fee) {
      details.push({ icon: <MdTrendingUp />, label: `₹${target.fee}` });
    }
    return details;
  };

  const getOpportunityDetails = () => {
    const target = app.targetId;
    if (!target) return [];
    
    const details = [];
    if (target.organization) {
      details.push({ icon: <MdBusiness />, label: target.organization });
    }
    if (target.location) {
      details.push({ icon: <MdLocationOn />, label: target.location });
    }
    if (target.type) {
      details.push({ icon: <MdDescription />, label: target.type });
    }
    if (target.duration) {
      details.push({ icon: <MdAccessTime />, label: target.duration });
    }
    if (target.stipend) {
      details.push({ icon: <MdTrendingUp />, label: target.stipend });
    }
    return details;
  };

  const details = app.targetType === 'exam' ? getExamDetails() : getOpportunityDetails();

  return (
    <div className="application-card">
      <div className="card-header">
        <div className="target-info">
          <div className="target-title-section">
            <h3 className="target-title">{getTargetTitle(app)}</h3>
            <div className="target-meta">
              <span className="meta-icon">
                {app.targetType === 'exam' ? <MdSchool /> : <MdBusiness />}
              </span>
              {getTargetMeta(app)}
            </div>
          </div>
          <span className="target-type">
            <span className="type-icon">
              {app.targetType === 'exam' ? <MdSchool /> : <MdBusiness />}
            </span>
            {app.targetType === 'exam' ? 'Exam' : 'Opportunity'}
          </span>
        </div>
        <div className="current-status">
          <span className="status-badge" style={{ backgroundColor: `${getStatusBadgeColor()}20`, color: getStatusBadgeColor() }}>
            <span className="status-icon-wrapper">{getStatusBadgeIcon()}</span>
            {getStatusBadgeLabel()}
          </span>
          <p className="submitted-date">
            <span className="date-icon"><MdCalendarToday /></span>
            Submitted: {formatDate(app.submittedAt)}
          </p>
        </div>
      </div>

      {details.length > 0 && (
        <div className="card-details">
          {details.map((detail, idx) => (
            <div key={idx} className="detail-item">
              <span className="detail-icon">{detail.icon}</span>
              <span>{detail.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="timeline">
        {timelineOrder.map((status, idx) => {
          const config = statusConfig[status];
          const isCompleted = config.order < currentOrder;
          const isCurrent = config.order === currentOrder;
          const isFuture = config.order > currentOrder;

          // For timeline, use dynamic values for the Decision step (last step)
          const displayLabel = status === 'APPROVED' ? getTimelineDecisionLabel() : config.label;
          const displayColor = status === 'APPROVED' ? getTimelineDecisionColor() : config.color;
          const displayIcon = status === 'APPROVED' ? getTimelineDecisionIcon() : config.icon;

          return (
            <div key={status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`}>
              <div className="timeline-marker">
                <div className="timeline-icon" style={{ backgroundColor: isFuture ? '#e2e8f0' : displayColor }}>
                  <span className="timeline-icon-inner">
                    {isCompleted ? <MdCheckCircle /> : displayIcon}
                  </span>
                </div>
                <div className="timeline-line" style={{ backgroundColor: isCompleted ? displayColor : '#e2e8f0' }} />
              </div>
              <div className="timeline-content">
                <div className="timeline-label">{displayLabel}</div>
                <div className="timeline-date">
                  {isCompleted && app.reviewedAt && status !== 'APPLIED' && formatDate(app.reviewedAt)}
                  {isCompleted && status === 'APPLIED' && formatDate(app.submittedAt)}
                  {isCurrent && ['APPROVED', 'REJECTED'].includes(currentStatus) && formatDate(app.reviewedAt)}
                  {isCurrent && !['APPROVED', 'REJECTED'].includes(currentStatus) && 'In progress'}
                  {isFuture && '—'}
                </div>
                {isCurrent && app.reviewNotes && (
                  <div className="review-notes">Note: {app.reviewNotes}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {app.status === 'APPLIED' && (
        <div className="card-footer">
          <p className="status-hint">Your application has been submitted successfully.</p>
        </div>
      )}
      {app.status === 'UNDER_REVIEW' && (
        <div className="card-footer">
          <p className="status-hint">Your application is under review. This typically takes 7-14 business days.</p>
        </div>
      )}
      {app.status === 'APPROVED' && (
        <div className="card-footer success">
          <p className="status-hint">Congratulations! Your application has been approved.</p>
        </div>
      )}
      {app.status === 'REJECTED' && (
        <div className="card-footer error">
          <p className="status-hint">Unfortunately, your application was not approved. {app.reviewNotes && `Reason: ${app.reviewNotes}`}</p>
        </div>
      )}
    </div>
  );
}