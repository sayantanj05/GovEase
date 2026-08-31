import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentApi } from '../api/profileApi';
import './DocumentsPage.css';

const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ documentType: 'Aadhaar' });
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const documentTypes = [
    'Aadhaar', 'PAN', 'Voter Card', 'Driving License',
    'Passport', 'Marksheet', 'Experience Certificate',
    'Income Certificate', 'Disability Certificate',
    'Birth Certificate', 'Signature', 'Domicile Certificate'
  ];

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    try {
      const res = await documentApi.getAll(user._id || user.id);
      if (res.success) setDocuments(res.documents);
    } catch (err) {
      setMessage('Failed to load documents');
    }
    setLoading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setMessage('');

    const uploadData = new FormData();
    uploadData.append('file', selectedFile);
    uploadData.append('userId', user._id || user.id);
    uploadData.append('documentType', formData.documentType);

    try {
      const res = await documentApi.upload(uploadData);
      if (res.success) {
        setMessage('Document uploaded successfully!');
        setSelectedFile(null);
        loadDocuments();
      } else {
        setMessage(res.message || 'Upload failed');
      }
    } catch (err) {
      setMessage('Upload failed');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    await documentApi.delete(id);
    setMessage('Document deleted!');
    loadDocuments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': return '#48bb78';
      case 'Pending': return '#ed8936';
      case 'Rejected': return '#e53e3e';
      default: return '#a0aec0';
    }
  };

  if (loading) return <div className="documents-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="documents-container">
      <div className="documents-card">
        <h2>My Documents</h2>

        {message && <div className="message">{message}</div>}

        <div className="upload-section">
          <h3>Upload Document</h3>
          <div className="upload-form">
            <div className="form-group">
              <label>Document Type *</label>
              <select value={formData.documentType} onChange={(e) => setFormData({ documentType: e.target.value })}>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div
              className={`drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <p className="file-selected">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
              ) : (
                <>
                  <p>Drag & drop file here</p>
                  <p className="or">or</p>
                  <p className="browse">Click to browse</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileSelect}
                hidden
              />
            </div>
            <button className="btn-upload" onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="documents-list">
          <h3>Uploaded Documents ({documents.length})</h3>
          {documents.length === 0 ? (
            <div className="empty-state">No documents uploaded yet.</div>
          ) : (
            <div className="document-grid">
              {documents.map(doc => (
                <div key={doc._id} className="document-item">
                  <div className="doc-info">
                    <span className="doc-type">{doc.documentType}</span>
                    <span className="doc-name">{doc.fileName}</span>
                    <span className="doc-size">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                    <span className="doc-status" style={{ color: getStatusColor(doc.verificationStatus) }}>
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <div className="doc-actions">
                    <a href={documentApi.getFileUrl(doc._id)} target="_blank" rel="noopener noreferrer" className="btn-view">View</a>
                    <button className="btn-delete" onClick={() => handleDelete(doc._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
