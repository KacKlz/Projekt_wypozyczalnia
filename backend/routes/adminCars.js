const express = require("express");
const mongoose = require("mongoose");

const Car = require("../models/Car");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Every endpoint below is for admins only
router.use(requireAdmin);

const carFields = [
    "make",
    "model",
    "mileage",
    "daily_rate",
    "doors",
    "is_rented",
    "fuel_type",
    "avg_fuel_consumption"
];

// Takes only the car fields that were sent (never "_id" or anything else)
function getCarData(body) {
    const carData = {};

    for (const field of carFields) {
        if (body && body[field] !== undefined) {
            carData[field] = body[field];
        }
    }

    return carData;
}

function sendCarError(res, error, logText) {
    if (error.name === "ValidationError") {
        return res.status(400).json({
            message: "Invalid car data"
        });
    }

    console.error(logText, error);

    return res.status(500).json({
        message: "Server error"
    });
}

// GET /api/admin/cars
router.get("/", async (req, res) => {
    try {
        const cars = await Car.find().sort({ make: 1, model: 1 });

        return res.json(cars);

    } catch (error) {
        return sendCarError(res, error, "Error loading cars:");
    }
});

// POST /api/admin/cars
router.post("/", async (req, res) => {
    try {
        const car = await Car.create(getCarData(req.body));

        return res.status(201).json(car);

    } catch (error) {
        return sendCarError(res, error, "Error adding car:");
    }
});

// PUT /api/admin/cars/:id
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({
                message: "Car not found"
            });
        }

        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({
                message: "Car not found"
            });
        }

        car.set(getCarData(req.body));
        await car.save();

        return res.json(car);

    } catch (error) {
        return sendCarError(res, error, "Error updating car:");
    }
});

// DELETE /api/admin/cars/:id
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({
                message: "Car not found"
            });
        }

        const car = await Car.findByIdAndDelete(req.params.id);

        if (!car) {
            return res.status(404).json({
                message: "Car not found"
            });
        }

        return res.json({
            message: "Car removed"
        });

    } catch (error) {
        return sendCarError(res, error, "Error removing car:");
    }
});

module.exports = router;
