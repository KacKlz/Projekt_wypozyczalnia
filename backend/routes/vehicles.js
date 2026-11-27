const express = require("express");
const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { fuel, maxPrice, sort } = req.query;
        const filter = {};

        if (fuel && fuel.toLowerCase() !== "all") {
            filter.fuel_type = new RegExp(`^${fuel}$`, "i");
        }

        if (maxPrice !== undefined && maxPrice !== "") {
            const parsedMaxPrice = Number(maxPrice);
            if (!Number.isNaN(parsedMaxPrice)) {
                filter.daily_rate = { $lte: parsedMaxPrice };
            }
        }

        let sortOption = { daily_rate: 1 };
        if (sort === "price-desc") {
            sortOption = { daily_rate: -1 };
        } else if (sort === "name-asc") {
            sortOption = { make: 1, model: 1 };
        }

        const vehicles = await Vehicle.find(filter).sort(sortOption);
        res.json(vehicles);
    } catch (error) {
        console.error("Blad pobierania pojazdow:", error);
        res.status(500).json({ message: "Nie udalo sie pobrac listy pojazdow" });
    }
});

router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Nieprawidlowe ID pojazdu" });
        }

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ message: "Nie znaleziono pojazdu" });
        }

        if (vehicle.is_rented) {
            return res.status(400).json({ message: "Ten pojazd jest już wypożyczony" });
        }

        vehicle.is_rented = true;
        await vehicle.save();

        // Create a matching Booking document for the authenticated user
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const bookingNumber = `BK-${new Date().getFullYear()}-${randomNum}`;

        const specs = [
            vehicle.fuel_type || null,
            vehicle.doors ? `${vehicle.doors} doors` : null,
            vehicle.avg_fuel_consumption ? `${vehicle.avg_fuel_consumption} L/100km` : null,
            vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : null
        ].filter(Boolean);

        const newBooking = await Booking.create({
            userId: req.userId,
            vehicleId: vehicle._id,
            bookingNumber,
            carName: `${vehicle.make} ${vehicle.model}`,
            category: vehicle.fuel_type || null,
            plate: null,
            image: null,
            status: "active",
            statusLabel: "Active",
            pickupDate: null,
            pickupLocation: null,
            returnDate: null,
            returnLocation: null,
            duration: null,
            dailyRate: vehicle.daily_rate ? `${vehicle.daily_rate} PLN` : null,
            totalPrice: null,
            paymentStatus: null,
            specs: specs.length > 0 ? specs : null,
            details: null
        });

        res.json({
            ...vehicle.toObject(),
            booking: newBooking
        });
    } catch (error) {
        console.error("Blad rezerwacji pojazdu:", error);
        res.status(500).json({ message: "Nie udalo sie zarezerwowac pojazdu" });
    }
});

module.exports = router;