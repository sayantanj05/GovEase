const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, ref: 'User' },
  skillType: {
    type: String,
    required: true,
    enum: ['Technical', 'Soft', 'Language', 'Certification']
  },
  name: { type: String, required: true, trim: true },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  details: { type: String }
}, { collection: 'skills', timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
