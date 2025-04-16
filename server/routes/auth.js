const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Validation middleware
const registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role is required').isIn(['farmer', 'customer', 'admin']),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('address.street', 'Street address is required').not().isEmpty(),
    check('address.city', 'City is required').not().isEmpty(),
    check('address.state', 'State is required').not().isEmpty(),
    check('address.pincode', 'Pincode is required').not().isEmpty()
];

const loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', auth, authController.getCurrentUser);

module.exports = router; 