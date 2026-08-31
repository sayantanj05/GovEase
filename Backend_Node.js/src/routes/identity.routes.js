const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identity.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:userId', identityController.get);
router.post('/', identityController.create);
router.post('/:userId/add', identityController.addId);
router.delete('/:userId/:idType', identityController.removeId);

module.exports = router;
