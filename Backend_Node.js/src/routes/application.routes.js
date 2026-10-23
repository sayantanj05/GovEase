const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(authMiddleware);

router.post('/', applicationController.submitApplication);
router.get('/', applicationController.getUserApplications);
router.get('/stats', requireRole('ADMIN'), applicationController.getApplicationStats);
router.get('/target/:targetType/:targetId', requireRole('ADMIN'), applicationController.getApplicationsForTarget);
router.get('/:id', applicationController.getApplicationById);
router.patch('/:id/status', requireRole('ADMIN'), applicationController.updateApplicationStatus);

module.exports = router;