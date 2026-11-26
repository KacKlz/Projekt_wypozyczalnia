const mongoose = require("mongoose");

// Matches the documents already stored in the "cars" collection
const carSchema = new mongoose.Schema({
    make: {
        type: String,
        required: true,
        trim: true
    },

    model: {
        type: String,
        required: true,
        trim: true
    },

    mileage: {
        type: Number,
        required: true,
        min: 0
    },

    daily_rate: {
        type: Number,
        required: true,
        min: 0
    },

    doors: {
        type: Number,
        required: true,
        min: 1
    },

    is_rented: {
        type: Boolean,
        default: false
    },

    fuel_type: {
        type: String,
        required: true,
        enum: ["petrol", "diesel", "hybrid", "plug-in hybrid", "electric"]
    },

    avg_fuel_consumption: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    // Existing documents have no "__v" field, so new ones should not get it either
    versionKey: false
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
