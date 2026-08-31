const Experience = require('../models/experience.model');

class ExperienceController {
  async getAll(req, res) {
    try {
      const { userId } = req.params;
      const experience = await Experience.find({ userId }).sort({ startDate: -1 });
      res.json({ success: true, experience });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const experience = await Experience.findById(id);
      if (!experience) {
        return res.status(404).json({ success: false, message: 'Experience entry not found' });
      }
      res.json({ success: true, experience });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const expId = 'EXP' + Date.now().toString().slice(-6);
      const experience = new Experience({ _id: expId, ...req.body });
      await experience.save();
      res.status(201).json({ success: true, experience });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const experience = await Experience.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
      if (!experience) {
        return res.status(404).json({ success: false, message: 'Experience entry not found' });
      }
      res.json({ success: true, experience });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const experience = await Experience.findByIdAndDelete(id);
      if (!experience) {
        return res.status(404).json({ success: false, message: 'Experience entry not found' });
      }
      res.json({ success: true, message: 'Experience entry deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ExperienceController();
