const Education = require('../models/education.model');

class EducationController {
  async getAll(req, res) {
    try {
      const { userId } = req.params;
      const education = await Education.find({ userId }).sort({ passingYear: -1 });
      res.json({ success: true, education });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const education = await Education.findById(id);
      if (!education) {
        return res.status(404).json({ success: false, message: 'Education entry not found' });
      }
      res.json({ success: true, education });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const eduId = 'EDU' + Date.now().toString().slice(-6);
      const education = new Education({ _id: eduId, ...req.body });
      await education.save();
      res.status(201).json({ success: true, education });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const education = await Education.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
      if (!education) {
        return res.status(404).json({ success: false, message: 'Education entry not found' });
      }
      res.json({ success: true, education });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const education = await Education.findByIdAndDelete(id);
      if (!education) {
        return res.status(404).json({ success: false, message: 'Education entry not found' });
      }
      res.json({ success: true, message: 'Education entry deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new EducationController();
