const UserPreference = require('../models/userPreference.model');

class PreferenceController {
  async get(req, res) {
    try {
      const { userId } = req.params;
      const preference = await UserPreference.findOne({ userId });
      if (!preference) {
        return res.status(404).json({ success: false, message: 'Preferences not found' });
      }
      res.json({ success: true, preference });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { userId } = req.body;
      const existing = await UserPreference.findOne({ userId });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Preferences already exist' });
      }

      const prefId = 'PREF' + Date.now().toString().slice(-6);
      const preference = new UserPreference({ _id: prefId, ...req.body });
      await preference.save();
      res.status(201).json({ success: true, preference });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { userId } = req.params;
      const preference = await UserPreference.findOneAndUpdate(
        { userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!preference) {
        return res.status(404).json({ success: false, message: 'Preferences not found' });
      }
      res.json({ success: true, preference });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PreferenceController();
