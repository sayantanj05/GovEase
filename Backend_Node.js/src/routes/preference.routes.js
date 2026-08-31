const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preference.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:userId', preferenceController.get);
router.post('/', preferenceController.create);
router.put('/:userId', preferenceController.update);

module.exports = router;
