import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import DynamicFormRenderer from '../components/DynamicFormRenderer';
import { applicationsApi } from '../api/examsApi';

export default function ExamApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      const res = await applicationsApi.submit('exam', id, formData);
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

  return <DynamicFormRenderer key={id} examId={id} onSubmit={handleSubmit} submitLabel="Submit Application" />;
}