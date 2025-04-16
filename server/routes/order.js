const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const orderController = require('../controllers/orderController');
const { auth, roleAuth } = require('../middleware/auth');

// Validation middleware
const orderValidation = [
    check('products', 'Products are required').isArray({ min: 1 }),
    check('products.*.product', 'Product ID is required').not().isEmpty(),
    check('products.*.quantity', 'Quantity is required').isInt({ min: 1 }),
    check('deliveryAddress.street', 'Street address is required').not().isEmpty(),
    check('deliveryAddress.city', 'City is required').not().isEmpty(),
    check('deliveryAddress.state', 'State is required').not().isEmpty(),
    check('deliveryAddress.pincode', 'Pincode is required').not().isEmpty(),
    check('paymentMethod', 'Payment method is required').isIn(['cash', 'online'])
];

const statusValidation = [
    check('status', 'Status is required').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
];

// Protected routes
router.post('/', [auth, roleAuth(['customer']), orderValidation], orderController.createOrder);
router.get('/', [auth, roleAuth(['customer', 'farmer', 'admin'])], orderController.getOrders);
router.get('/:id', [auth, roleAuth(['customer', 'farmer', 'admin'])], orderController.getOrderById);
router.put('/:id/status', [auth, roleAuth(['farmer', 'admin']), statusValidation], orderController.updateOrderStatus);
router.put('/:id/cancel', [auth, roleAuth(['customer', 'farmer', 'admin'])], orderController.cancelOrder);

module.exports = router; 