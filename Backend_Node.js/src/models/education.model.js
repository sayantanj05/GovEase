const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, ref: 'User' },
  educationType: {
    type: String,
    required: true,
    enum: ['Primary', 'Secondary', 'Higher Secondary', 'Under-Graduate', 'Post Graduate', 'Phd']
  },
  schoolName: { type: String },
  boardUniversity: { type: String },
  stream: { type: String, enum: ['Science', 'Commerce', 'Arts', ''] },
  subjects: [String],
  degree: { type: String },
  specialization: { type: String },
  course: { type: String },
  institution: { type: String },
  thesisTitle: { type: String },
  supervisor: { type: String },
  researchArea: { type: String },
  startingYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 10
  },
  passingYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 10
  },
  percentageCgpa: { type: Number },
  marksheetFileId: { type: String },
  certificateFileId: { type: String }
}, { collection: 'education', timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
