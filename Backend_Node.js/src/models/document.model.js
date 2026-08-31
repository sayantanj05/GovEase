const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, ref: 'User', index: true },
  documentType: {
    type: String,
    required: true
  },
  educationId: { type: String, ref: 'Education', default: null },
  experienceId: { type: String, ref: 'Experience', default: null },
  fileName: { type: String, required: true },
  fileSize: { type: Number },
  mimeType: { type: String },
  gridFsFileId: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ['Unverified', 'Pending', 'Verified', 'Rejected'],
    default: 'Unverified'
  }
}, { collection: 'documents', timestamps: true });

documentSchema.index({ userId: 1, documentType: 1 });
documentSchema.index({ educationId: 1 });
documentSchema.index({ experienceId: 1 });

module.exports = mongoose.model('Document', documentSchema);
