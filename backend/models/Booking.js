const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        default: null
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
        default: null
    },
    plate: {
        type: String,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["active", "upcoming", "completed", "cancelled"],
        default: "upcoming"
    },
    statusLabel: {
        type: String,
        default: null
    },
    pickupDate: {
        type: String,
        default: null
    },
    pickupLocation: {
        type: String,
        default: null
    },
    returnDate: {
        type: String,
        default: null
    },
    returnLocation: {
        type: String,
        default: null
    },
    duration: {
        type: String,
        default: null
    },
    dailyRate: {
        type: String,
        default: null
    },
    totalPrice: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        default: null
    },
    specs: {
        type: [String],
        default: null
    },
    details: {
        insurance: {
            type: String,
            default: null
        },
        deposit: {
            type: String,
            default: null
        },
        mileage: {
            type: String,
            default: null
        },
        extras: {
            type: [String],
            default: null
        },
        support: {
            type: String,
            default: null
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
