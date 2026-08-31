const Identity = require('../models/identity.model');

class IdentityController {
  async get(req, res) {
    try {
      const { userId } = req.params;
      const identity = await Identity.findOne({ userId });
      if (!identity) {
        return res.status(404).json({ success: false, message: 'Identity records not found' });
      }
      res.json({ success: true, identity });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { userId, ids } = req.body;

      const existing = await Identity.findOne({ userId });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Identity records already exist' });
      }

      const idId = 'IDEN' + Date.now().toString().slice(-6);
      const identity = new Identity({ _id: idId, userId, ids });
      await identity.save();
      res.status(201).json({ success: true, identity });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addId(req, res) {
    try {
      const { userId } = req.params;
      const { idType, idNumber, imageFileId, verified } = req.body;

      const identity = await Identity.findOne({ userId });
      if (!identity) {
        const idId = 'IDEN' + Date.now().toString().slice(-6);
        const newIdentity = new Identity({
          _id: idId,
          userId,
          ids: [{ idType, idNumber, imageFileId, verified }]
        });
        await newIdentity.save();
        return res.status(201).json({ success: true, identity: newIdentity });
      }

      identity.ids.push({ idType, idNumber, imageFileId, verified });
      await identity.save();
      res.json({ success: true, identity });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async removeId(req, res) {
    try {
      const { userId, idType } = req.params;
      const identity = await Identity.findOne({ userId });
      if (!identity) {
        return res.status(404).json({ success: false, message: 'Identity records not found' });
      }

      identity.ids = identity.ids.filter(id => id.idType !== idType);
      await identity.save();
      res.json({ success: true, identity });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new IdentityController();
