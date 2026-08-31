const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certification.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:userId', certificationController.getAll);
router.get('/:userId/:id', certificationController.getOne);
router.post('/', certificationController.create);
router.put('/:id', certificationController.update);
router.delete('/:id', certificationController.delete);

module.exports = router;
