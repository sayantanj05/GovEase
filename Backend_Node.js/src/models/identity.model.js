const mongoose = require('mongoose');

const identitySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, ref: 'User' },
  ids: [
    {
      idType: {
        type: String,
        enum: ['Aadhaar', 'PAN', 'Voter Card', 'Driving License', 'ABC ID']
      },
      idNumber: { type: String, required: true },
      imageFileId: { type: String },
      verified: { type: Boolean, default: false }
    }
  ]
}, { collection: 'identities', timestamps: true });

identitySchema.pre('save', function (next) {
  const imageRequiredTypes = ['Aadhaar', 'PAN', 'Voter Card', 'Driving License'];
  for (const id of this.ids) {
    if (imageRequiredTypes.includes(id.idType) && !id.imageFileId) {
      return next(new Error(`Image is required for ${id.idType}`));
    }
    if (id.idType === 'ABC ID' && id.imageFileId) {
      id.imageFileId = undefined;
    }
  }
  next();
});

module.exports = mongoose.model('Identity', identitySchema);
