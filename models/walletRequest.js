const mongoose = require('mongoose');

const walletRequestSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin&SuperAdmin',
        required: true
    },
    requestedAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const WalletRequest = mongoose.model('WalletRequest', walletRequestSchema);

module.exports = WalletRequest;
