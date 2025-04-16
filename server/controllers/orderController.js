const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { products, deliveryAddress, paymentMethod } = req.body;

        // Calculate total amount and validate products
        let totalAmount = 0;
        const orderProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.product);
            
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }

            if (!product.isAvailable) {
                return res.status(400).json({ message: `Product ${product.name} is not available` });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient quantity for ${product.name}` });
            }

            totalAmount += product.price * item.quantity;
            orderProducts.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            // Update product quantity
            product.quantity -= item.quantity;
            if (product.quantity === 0) {
                product.isAvailable = false;
            }
            await product.save();
        }

        const order = new Order({
            customer: req.user.id,
            farmer: products[0].farmer, // Assuming all products are from the same farmer
            products: orderProducts,
            totalAmount,
            deliveryAddress,
            paymentMethod
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders for a user
exports.getOrders = async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'customer') {
            query.customer = req.user.id;
        } else if (req.user.role === 'farmer') {
            query.farmer = req.user.id;
        }

        const orders = await Order.find(query)
            .populate('products.product', 'name images')
            .populate('customer', 'name')
            .populate('farmer', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('products.product', 'name images')
            .populate('customer', 'name phone address')
            .populate('farmer', 'name phone address');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to view this order
        if (order.customer._id.toString() !== req.user.id && 
            order.farmer._id.toString() !== req.user.id && 
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to update this order
        if (order.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.status = status;
        if (status === 'delivered') {
            order.actualDelivery = Date.now();
        }

        await order.save();
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to cancel this order
        if (order.customer.toString() !== req.user.id && 
            order.farmer.toString() !== req.user.id && 
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Only allow cancellation if order is not already delivered or cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot cancel this order' });
        }

        // Restore product quantities
        for (const item of order.products) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity += item.quantity;
                product.isAvailable = true;
                await product.save();
            }
        }

        order.status = 'cancelled';
        await order.save();
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}; 