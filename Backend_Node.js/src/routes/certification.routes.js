const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certification.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authMiddleware);

// Specific routes must come before parameterized routes
router.post('/upload-image', upload.single('image'), certificationController.uploadImage);
router.post('/validate-url', certificationController.validateUrl);
router.get('/image/:fileId', certificationController.getImageByFileId);

// Parameterized routes
router.get('/:userId', certificationController.getAll);
router.get('/:userId/:id', certificationController.getOne);
router.post('/', certificationController.create);
router.put('/:id', certificationController.update);
router.delete('/:id', certificationController.delete);
router.get('/:id/image', certificationController.getImage);

module.exports = router;