const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, ref: 'User' },
  villageTown: { type: String, trim: true },
  district: { type: String, trim: true },
  pinCode: { type: String, match: /^\d{6}$/ },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, default: 'India' }
}, { collection: 'addresses', timestamps: true });

addressSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Address', addressSchema);
