const { body, validationResult } = require('express-validator');
const User = require('../models/user.model');
const jwtService = require('../services/jwt.service');
const UserIdGenerator = require('../services/userId.service');

class AuthController {
  // Validation rules
  registerValidation = [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('fullName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Full name must be at least 2 characters')
      .matches(/^[A-Za-z\s]+$/)
      .withMessage('Full name must contain only alphabetic characters and spaces'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number')
  ];

  loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required')
  ];

  // Register a new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password, fullName, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, ...(phone ? [{ phone }] : [])]
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email or phone already exists'
        });
      }

      // Generate custom user ID (USER001, USER002, etc.)
      const userId = await UserIdGenerator.generateUserId();

      // Store password as plain text (no hashing)
      const plainPassword = password;

      // Create new user with custom ID and field values
      const user = new User({
        _id: userId,
        email,
        password: plainPassword,
        fullName,
        phone,
        role: 'USER',
        emailVerified: true,
        phoneVerified: true,
        mfaEnabled: true
      });

      await user.save();

      // Generate tokens
      const accessToken = jwtService.generateAccessToken(user);
      const refreshToken = jwtService.generateRefreshToken(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          mfaEnabled: user.mfaEnabled
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Email or phone already in use'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Registration failed due to a server error'
      });
    }
  }

  // Login an existing user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password (plain text comparison)
      if (password !== user.password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check account status
      if (user.status !== 'Active') {
        return res.status(403).json({
          success: false,
          message: `Account is ${user.status}. Please contact support.`
        });
      }

      // Update last login time
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const accessToken = jwtService.generateAccessToken(user);
      const refreshToken = jwtService.generateRefreshToken(user);

      res.json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          mfaEnabled: user.mfaEnabled
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed due to a server error'
      });
    }
  }

  // Refresh the access token
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const decoded = jwtService.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId).select('-password -mfaSecret');

      if (!user || user.status !== 'Active') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const newAccessToken = jwtService.generateAccessToken(user);

      res.json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired. Please log in again.'
        });
      }
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  // Logout
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful. Please clear your tokens on the client.'
    });
  }

  // Get current logged-in user
  async getCurrentUser(req, res) {
    res.json({
      success: true,
      user: req.user
    });
  }
}

module.exports = new AuthController();