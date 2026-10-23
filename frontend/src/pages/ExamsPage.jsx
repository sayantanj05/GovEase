import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examsApi } from '../api/examsApi';
import { MdCalendarToday, MdAccessTime, MdCategory, MdSchool, MdDescription, MdPerson, MdLocationOn, MdArrowForward, MdCheckCircle, MdOutlineWorkOutline } from 'react-icons/md';
import './ExamsPage.css';

const statusClass = (status) => `exam-badge-${(status || '').toLowerCase().replace(/ /g, '-')}`;

const statusBadge = (status) => {
  const label = status || 'Upcoming';
  return <span className={`exam-badge ${statusClass(status)}`}>{label}</span>;
};

export default function ExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    examsApi.list()
      .then((data) => {
        if (data.success) {
          setExams(data.items || []);
        } else {
          setError(data.message || 'Failed to load exams');
        }
      })
      .catch(() => setError('Failed to load exams'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><span className="loading-icon"><MdSchool /></span>Loading exams...</div>;

  return (
    <div className="exams-page">
      <h1 className="exams-title">Available Exams</h1>
      {error && <div style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</div>}
      {exams.length === 0 ? (
        <div style={{ color: '#7180ac' }}>No exams available right now. Please check back later.</div>
      ) : (
        <div className="exam-grid">
          {exams.map((exam) => (
            <div key={exam._id} className="exam-card">
              <div className="exam-card-header">
                <div className="exam-card-title-section">
                  <div className="exam-card-title">{exam.examName}</div>
                  <div className="exam-card-subtitle">
                    <MdSchool className="icon" />
                    {exam.examBody}
                  </div>
                </div>
                {statusBadge(exam.status)}
              </div>
              
              <div className="exam-card-body">
                {exam.examCategory && (
                  <div className="exam-info-item">
                    <MdCategory className="info-icon" />
                    <span>{exam.examCategory}</span>
                  </div>
                )}
                {exam.examMode && (
                  <div className="exam-info-item">
                    <MdDescription className="info-icon" />
                    <span>{exam.examMode}</span>
                  </div>
                )}
                {exam.durationMinutes && (
                  <div className="exam-info-item">
                    <MdAccessTime className="info-icon" />
                    <span>{exam.durationMinutes} minutes</span>
                  </div>
                )}
                {exam.eligibility && (
                  <div className="exam-info-item">
                    <MdPerson className="info-icon" />
                    <span>{exam.eligibility}</span>
                  </div>
                )}
                {exam.fee && (
                  <div className="exam-info-item">
                    <MdCheckCircle className="info-icon" />
                    <span>Fee: ₹{exam.fee}</span>
                  </div>
                )}
                {exam.venue && (
                  <div className="exam-info-item">
                    <MdLocationOn className="info-icon" />
                    <span>{exam.venue}</span>
                  </div>
                )}
              </div>
              
              <div className="exam-card-meta">
                {exam.applicationStartDate && (
                  <div className="meta-item">
                    <MdCalendarToday className="meta-icon" />
                    <span>Apply: {new Date(exam.applicationStartDate).toLocaleDateString()}</span>
                  </div>
                )}
                {exam.applicationDeadline && (
                  <div className="meta-item">
                    <MdCalendarToday className="meta-icon" />
                    <span>Deadline: {new Date(exam.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                )}
                {exam.examDate && (
                  <div className="meta-item">
                    <MdCalendarToday className="meta-icon" />
                    <span>Exam: {new Date(exam.examDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="exam-card-actions">
                <button className="btn btn-secondary" onClick={() => navigate(`/exams/${exam._id}`)}>
                  View Details
                </button>
                <button className="btn btn-primary" onClick={() => navigate(`/exams/${exam._id}/apply`)}>
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
