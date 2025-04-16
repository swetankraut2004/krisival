const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['farmer', 'customer', 'admin'],
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        }
    },
    // Farmer specific fields
    farmDetails: {
        farmName: String,
        farmSize: Number,
        farmType: String,
        documents: [String],
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    // Customer specific fields
    customerDetails: {
        preferences: [String],
        savedAddresses: [{
            street: String,
            city: String,
            state: String,
            pincode: String,
            isDefault: Boolean
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create 2dsphere index for geospatial queries
userSchema.index({ 'address.coordinates': '2dsphere' });

module.exports = mongoose.model('User', userSchema); 