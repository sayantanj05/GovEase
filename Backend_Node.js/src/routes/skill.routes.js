const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:userId', skillController.getAll);
router.post('/', skillController.create);
router.put('/:id', skillController.update);
router.delete('/:id', skillController.delete);

module.exports = router;
