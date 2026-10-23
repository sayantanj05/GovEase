const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunity.controller');
const applicationController = require('../controllers/application.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', opportunityController.listOpportunities);
router.get('/:id', opportunityController.getOpportunity);
router.get('/:id/form', authMiddleware, opportunityController.getOpportunityForm);
router.post('/:id/apply', authMiddleware, applicationController.submitApplication);

module.exports = router;
