import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import DynamicFormRenderer from '../components/DynamicFormRenderer';
import { applicationsApi } from '../api/examsApi';

export default function OpportunityApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchForm = (id) => {
    return fetch(`/api/opportunities/${id}/form`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json());
  };

  const handleSubmit = async (formData) => {
    try {
      const res = await applicationsApi.submit('opportunity', id, formData);
      if (res.success) {
        alert('Application submitted successfully!');
        navigate('/applications');
      } else {
        alert(res.message || 'Failed to submit application');
      }
    } catch (err) {
      alert('Error submitting application');
    }
  };

  return (
    <DynamicFormRenderer
      key={id}
      fetchForm={fetchForm}
      onSubmit={handleSubmit}
      submitLabel="Submit Application"
    />
  );
}