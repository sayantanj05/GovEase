const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, ref: 'User', index: true },
  name: { type: String, required: true, trim: true },
  issuingOrganization: { type: String, required: true, trim: true },
  credentialId: { type: String },
  credentialUrl: { type: String },
  category: { type: String, enum: ['Technical', 'Professional', 'Academic', 'License', 'Other'], default: 'Technical' },
  imageFileId: { type: String }
}, { collection: 'certifications', timestamps: true });

module.exports = mongoose.model('Certification', certificationSchema);
