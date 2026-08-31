const Skill = require('../models/skill.model');

class SkillController {
  async getAll(req, res) {
    try {
      const { userId } = req.params;
      const skills = await Skill.find({ userId });
      res.json({ success: true, skills });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const skillId = 'SKL' + Date.now().toString().slice(-6);
      const skill = new Skill({ _id: skillId, ...req.body });
      await skill.save();
      res.status(201).json({ success: true, skill });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const skill = await Skill.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
      if (!skill) {
        return res.status(404).json({ success: false, message: 'Skill not found' });
      }
      res.json({ success: true, skill });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const skill = await Skill.findByIdAndDelete(id);
      if (!skill) {
        return res.status(404).json({ success: false, message: 'Skill not found' });
      }
      res.json({ success: true, message: 'Skill deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SkillController();
