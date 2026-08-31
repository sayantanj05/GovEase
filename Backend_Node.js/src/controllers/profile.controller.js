const Profile = require('../models/profile.model');
const Address = require('../models/address.model');
const { calculateAge, calculateCompleteness } = require('../utils/profileUtils');

class ProfileController {
  async getProfile(req, res) {
    try {
      const { userId } = req.params;
      const profile = await Profile.findOne({ userId });
      if (!profile) {
        return res.json({ success: true, profile: null, address: null });
      }
      const address = await Address.findOne({ userId });
      res.json({ success: true, profile, address });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async upsertProfile(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const { _id, ...cleanBody } = req.body;

      let profile = await Profile.findOne({ userId });

      if (profile) {
        await Profile.updateOne({ userId }, { $set: cleanBody });
        profile = await Profile.findOne({ userId });
        profile.age = calculateAge(profile.dateOfBirth);
        profile.completenessScore = calculateCompleteness(profile);
        await profile.save();
        res.json({ success: true, profile, message: 'Profile updated' });
      } else {
        const profileId = 'PROF' + Date.now().toString().slice(-6);
        profile = new Profile({
          _id: profileId,
          ...cleanBody
        });
        await profile.save();
        res.status(201).json({ success: true, profile, message: 'Profile created' });
      }
    } catch (error) {
      console.error('Upsert profile error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createProfile(req, res) {
    return this.upsertProfile(req, res);
  }

  async updateProfile(req, res) {
    return this.upsertProfile(req, res);
  }

  async deleteProfile(req, res) {
    try {
      const { userId } = req.params;
      await Profile.findOneAndDelete({ userId });
      await Address.findOneAndDelete({ userId });
      res.json({ success: true, message: 'Profile deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async upsertAddress(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const { _id, ...cleanBody } = req.body;

      let address = await Address.findOne({ userId });

      if (address) {
        await Address.updateOne({ userId }, { $set: cleanBody });
        address = await Address.findOne({ userId });
        res.json({ success: true, address, message: 'Address updated' });
      } else {
        const addressId = 'ADDR' + Date.now().toString().slice(-6);
        address = new Address({ _id: addressId, ...cleanBody });
        await address.save();
        res.status(201).json({ success: true, address, message: 'Address created' });
      }
    } catch (error) {
      console.error('Upsert address error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createAddress(req, res) {
    return this.upsertAddress(req, res);
  }

  async updateAddress(req, res) {
    try {
      const { userId } = req.params;
      const { _id, ...cleanBody } = req.body;

      let address = await Address.findOne({ userId });

      if (address) {
        await Address.updateOne({ userId }, { $set: cleanBody });
        address = await Address.findOne({ userId });
        res.json({ success: true, address, message: 'Address updated' });
      } else {
        const addressId = 'ADDR' + Date.now().toString().slice(-6);
        address = new Address({ _id: addressId, ...cleanBody });
        await address.save();
        res.status(201).json({ success: true, address, message: 'Address created' });
      }
    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProfileController();
