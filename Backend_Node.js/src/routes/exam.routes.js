const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const applicationController = require('../controllers/application.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', examController.listExams);
router.get('/:id', examController.getExam);
router.get('/:id/form', authMiddleware, examController.getExamForm);
router.post('/:id/apply', authMiddleware, applicationController.submitApplication);

module.exports = router;
