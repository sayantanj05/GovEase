const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:userId', profileController.getProfile);
router.post('/upsert', profileController.upsertProfile);
router.post('/', profileController.createProfile);
router.put('/:userId', profileController.updateProfile);
router.delete('/:userId', profileController.deleteProfile);

router.post('/address/upsert', profileController.upsertAddress);
router.post('/address', profileController.createAddress);
router.put('/address/:userId', profileController.updateAddress);

module.exports = router;
