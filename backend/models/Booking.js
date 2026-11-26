const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    bookingNumber: {
        type: String,
        required: true,
        unique: true
    },
    carName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "Standard"
    },
    plate: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["active", "upcoming", "completed", "cancelled"],
        default: "upcoming"
    },
    statusLabel: {
        type: String,
        default: "Confirmed"
    },
    pickupDate: {
        type: String,
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    returnDate: {
        type: String,
        required: true
    },
    returnLocation: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        default: ""
    },
    dailyRate: {
        type: String,
        default: ""
    },
    totalPrice: {
        type: String,
        default: ""
    },
    paymentStatus: {
        type: String,
        default: "Paid Online"
    },
    specs: {
        type: [String],
        default: []
    },
    details: {
        insurance: {
            type: String,
            default: "Full Comprehensive Cover (0 PLN Deductible)"
        },
        deposit: {
            type: String,
            default: "1 500 PLN (Pre-authorized on card)"
        },
        mileage: {
            type: String,
            default: "Unlimited kilometers"
        },
        extras: {
            type: [String],
            default: []
        },
        support: {
            type: String,
            default: "+48 22 100 20 30"
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
