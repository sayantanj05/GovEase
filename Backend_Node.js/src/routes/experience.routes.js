const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experience.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:userId', experienceController.getAll);
router.get('/:userId/:id', experienceController.getOne);
router.post('/', experienceController.create);
router.put('/:id', experienceController.update);
router.delete('/:id', experienceController.delete);

module.exports = router;
