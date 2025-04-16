const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Create new product
exports.createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = new Product({
            ...req.body,
            farmer: req.user.id
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all products with filters
exports.getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, radius, lat, lng } = req.query;
        let query = { isAvailable: true, isApproved: true };

        // Apply category filter
        if (category) {
            query.category = category;
        }

        // Apply price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Apply location filter
        if (radius && lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(lng), Number(lat)]
                    },
                    $maxDistance: Number(radius) * 1000 // Convert km to meters
                }
            };
        }

        const products = await Product.find(query)
            .populate('farmer', 'name farmDetails.farmName')
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('farmer', 'name farmDetails.farmName phone address')
            .populate('reviews.user', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the owner
        if (product.farmer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the owner
        if (product.farmer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await product.remove();
        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add review to product
exports.addReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { rating, comment } = req.body;

        const review = {
            user: req.user.id,
            rating,
            comment
        };

        product.reviews.unshift(review);

        // Calculate average rating
        product.rating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;

        await product.save();
        res.json(product.reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}; 