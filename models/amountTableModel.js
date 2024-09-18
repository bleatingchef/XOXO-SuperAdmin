const mongoose = require('mongoose');

const amountTableSchema = new mongoose.Schema({
    serial: { type: String, required: true }, // Changed id to serial
    name: { type: String, required: true },
    organization: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['completed', 'pending'], // Define valid statuses here
        required: true
    },
});

const AmountTable = mongoose.model('AmountTable', amountTableSchema);

module.exports = { AmountTable };
