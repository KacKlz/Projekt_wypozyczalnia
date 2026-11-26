const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
    {
        make: { type: String, required: true, trim: true },
        model: { type: String, required: true, trim: true },
        mileage: { type: Number },
        daily_rate: { type: Number, required: true },
        doors: { type: Number },
        is_rented: { type: Boolean, default: false },
        fuel_type: { type: String, trim: true },
        avg_fuel_consumption: { type: Number },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema, "cars");