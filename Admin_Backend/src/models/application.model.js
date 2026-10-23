const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user: { type: String, required: true, ref: 'AdminUser' },
  targetType: { type: String, required: true, enum: ['exam', 'opportunity'] },
  targetId: { type: String, required: true },
  formId: { type: String, required: true },
  formData: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ['APPLIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'APPLIED'
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: String, ref: 'AdminUser' },
  reviewNotes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'applications', timestamps: true });

applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ targetType: 1, targetId: 1, status: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);