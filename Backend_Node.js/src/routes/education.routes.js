const express = require('express');
const router = express.Router();
const educationController = require('../controllers/education.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:userId', educationController.getAll);
router.get('/:userId/:id', educationController.getOne);
router.post('/', educationController.create);
router.put('/:id', educationController.update);
router.delete('/:id', educationController.delete);

module.exports = router;
