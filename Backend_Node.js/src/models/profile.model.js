const mongoose = require('mongoose');
const { calculateAge, calculateCompleteness } = require('../utils/profileUtils');

const profileSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, ref: 'User' },
  fatherName: { type: String, trim: true },
  motherName: { type: String, trim: true },
  fatherPhoneNumber: { type: String, trim: true },
  motherPhoneNumber: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  abcId: { type: String, trim: true },
  dateOfBirth: { type: Date },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  profession: { type: String, trim: true },
  category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] },
  income: { type: Number, min: 0 },
  disability: {
    hasDisability: { type: Boolean, default: false },
    type: { type: String },
    percentage: { type: Number, min: 0, max: 100 }
  },
  completenessScore: { type: Number, default: 0, min: 0, max: 100 }
}, { collection: 'profiles', timestamps: true });

profileSchema.index({ userId: 1 }, { unique: true });

profileSchema.pre('save', function (next) {
  if (this.dateOfBirth) {
    this.age = calculateAge(this.dateOfBirth);
  }
  this.completenessScore = calculateCompleteness(this);
  next();
});

profileSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.dateOfBirth) {
    update.age = calculateAge(update.dateOfBirth);
  }
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
