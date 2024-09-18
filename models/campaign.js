const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    campaignName: {
        type: String,
        trim: true
    },
    campaignStartDate: {
        type: Date,
        default: Date.now
    },
    campaignEndDate: {
        type: Date,
        default: function() {
            const defaultEndDate = new Date(this.campaignStartDate);
            defaultEndDate.setDate(defaultEndDate.getDate() + 60);
            return defaultEndDate;
        }
    },
    country: {
        type: String,
        default: 'India'
    },
    denominationCurrency: {
        type: Number,
        default: 2000
    },
    productCategories: {
        type: [String]
    },
    giftVoucherBrand: {
        type: [String]
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin&SuperAdmin'
    },
    status: {
        type: String,
        enum: ['planning', 'running', 'completed'],
        default: 'planning' // default status
    },
    landingPage: {
        template: {
            logoImg: {
                type: String, // URL or base64-encoded image string
                // required: true
            },
            mainImage: {
                type: String, // URL or base64-encoded image string
                // required: true
            },
            title: {
                type: String,
                // required: true,
                trim: true
            },
            description: {
                type: String,
                // required: true,
                trim: true
            },
            buttonName: {
                type: String,
                // required: true,
                trim: true
            },
            url:{
                type: String,
                // required: true,
                trim: true  
            }
        }
    }
}, { timestamps: true });

// Method to set the status based on dates
campaignSchema.methods.updateStatus = function() {
    const today = new Date();
    if (today < this.campaignStartDate) {
        this.status = 'planning';
    } else if (today >= this.campaignStartDate && today <= this.campaignEndDate) {
        this.status = 'running';
    } else {
        this.status = 'completed';
    }
};

// Hook to automatically update status before saving
campaignSchema.pre('save', function(next) {
    this.updateStatus(); // Automatically update the status based on dates
    next();
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
