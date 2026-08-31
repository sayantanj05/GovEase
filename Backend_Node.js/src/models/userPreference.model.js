const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, unique: true, ref: 'User' },
  hobbies: [String],
  interests: [String],
  preferredLanguages: { type: [String], default: ['English'] },
  locationPreferences: [String],
  opportunityTypePreferences: [String],
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  }
}, { collection: 'user_preferences', timestamps: true });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
