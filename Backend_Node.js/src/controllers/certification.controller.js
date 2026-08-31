const Certification = require('../models/certification.model');

class CertificationController {
  async getAll(req, res) {
    try {
      const { userId } = req.params;
      const certifications = await Certification.find({ userId }).sort({ issueDate: -1 });
      res.json({ success: true, certifications });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const certification = await Certification.findById(id);
      if (!certification) {
        return res.status(404).json({ success: false, message: 'Certification not found' });
      }
      res.json({ success: true, certification });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const certId = 'CERT' + Date.now().toString().slice(-6);
      const certification = new Certification({
        _id: certId,
        ...req.body
      });
      await certification.save();
      res.status(201).json({ success: true, certification });
    } catch (error) {
      console.error('Create certification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const certification = await Certification.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!certification) {
        return res.status(404).json({ success: false, message: 'Certification not found' });
      }
      res.json({ success: true, certification });
    } catch (error) {
      console.error('Update certification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const certification = await Certification.findByIdAndDelete(id);
      if (!certification) {
        return res.status(404).json({ success: false, message: 'Certification not found' });
      }
      res.json({ success: true, message: 'Certification deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CertificationController();
