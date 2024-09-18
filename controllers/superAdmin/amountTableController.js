const asyncHandler = require('express-async-handler');
const { AmountTable } = require('../../models/amountTableModel');

// Function to handle adding amount table
const amounttable = async (req, res) => {
    try {
        const { serial, name, organization, amount, status } = req.body;
        console.log('Serial:', serial);

        // Check if the user already exists by serial
        let user = await AmountTable.findOne({ serial }).select('name organization amount status');

        if (user) {
            return res.status(200).json({
                success: true,
                code: 200,
                name: user.name,
                organization: user.organization,
                amount: user.amount,
                status: user.status,
            });
        }

        // If user does not exist, create a new entry
        user = new AmountTable({ serial, name, organization, amount, status });
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            user: {
                serial: user.serial,
                name: user.name,
                organization: user.organization,
                amount: user.amount,
                status: user.status,
            },
        });
    } catch (error) {
        console.error("Error managing user:", error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// Function to handle retrieving amount table data
const gettable = asyncHandler(async (req, res) => {
    const gettabledata = await AmountTable.find();
    res.status(200).json(gettabledata);
});

// Function to handle viewing a user by serial
const viewUserBySerial = asyncHandler(async (req, res) => {
    const { serial } = req.params;

    // Find the user by serial
    const user = await AmountTable.findOne({ serial });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    res.status(200).json({
        success: true,
        user: {
            serial: user.serial,
            name: user.name,
            organization: user.organization,
            amount: user.amount,
            status: user.status,
        },
    });
});

// Function to handle updating a user's data by serial
const updateUserBySerial = asyncHandler(async (req, res) => {
    const { serial } = req.params;
    const { name, organization, amount, status } = req.body;

    // Find the user by serial and update their data
    const user = await AmountTable.findOneAndUpdate(
        { serial },
        { name, organization, amount, status },
        { new: true, runValidators: true } // Return the updated document
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: {
            serial: user.serial,
            name: user.name,
            organization: user.organization,
            amount: user.amount,
            status: user.status,
        },
    });
});

// Function to handle deleting a user by serial
const deleteUserBySerial = asyncHandler(async (req, res) => {
    const { serial } = req.params;

    // Find and delete the user by serial
    const user = await AmountTable.findOneAndDelete({ serial });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        user: {
            serial: user.serial,
            name: user.name,
            organization: user.organization,
            amount: user.amount,
            status: user.status,
        },
    });
});

module.exports = { amounttable, gettable, viewUserBySerial, updateUserBySerial, deleteUserBySerial };
