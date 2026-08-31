const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes (no authentication needed)
router.post(
  '/register',
  authController.registerValidation,
  authController.register
);

router.post(
  '/login',
  authController.loginValidation,
  authController.login
);

router.post('/refresh', authController.refresh);

// Protected routes (authentication required)
router.use(authMiddleware);

router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

module.exports = router;