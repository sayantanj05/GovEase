const mongoose = require('mongoose');
const { calculateExperienceDuration } = require('../utils/profileUtils');

const experienceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, ref: 'User' },
  organization: { type: String, required: true, trim: true },
  role: { type: String, trim: true },
  employmentStatus: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  durationMonths: { type: Number },
  description: { type: String },
  experienceCertificateFileId: { type: String },
  currentlyWorking: { type: Boolean, default: false }
}, { collection: 'experience', timestamps: true });

experienceSchema.pre('save', function (next) {
  this.durationMonths = calculateExperienceDuration(this.startDate, this.endDate);
  next();
});

module.exports = mongoose.model('Experience', experienceSchema);
