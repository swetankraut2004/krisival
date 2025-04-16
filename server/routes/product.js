const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const productController = require('../controllers/productController');
const { auth, roleAuth } = require('../middleware/auth');

// Validation middleware
const productValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').isIn(['crops', 'vegetables', 'fruits', 'tools', 'fertilizers', 'seeds']),
    check('price', 'Price is required').isNumeric(),
    check('quantity', 'Quantity is required').isNumeric(),
    check('unit', 'Unit is required').isIn(['kg', 'g', 'piece', 'packet', 'litre']),
    check('images', 'At least one image is required').isArray({ min: 1 }),
    check('location.coordinates', 'Location coordinates are required').isArray({ min: 2, max: 2 })
];

const reviewValidation = [
    check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty()
];

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected routes
router.post('/', [auth, roleAuth(['farmer']), productValidation], productController.createProduct);
router.put('/:id', [auth, roleAuth(['farmer']), productValidation], productController.updateProduct);
router.delete('/:id', [auth, roleAuth(['farmer'])], productController.deleteProduct);
router.post('/:id/reviews', [auth, roleAuth(['customer']), reviewValidation], productController.addReview);

module.exports = router; 