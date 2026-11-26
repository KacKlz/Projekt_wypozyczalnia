const express = require("express");
const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

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

router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Nieprawidlowe ID pojazdu" });
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { $set: { is_rented: true } },
            { new: true, runValidators: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({ message: "Nie znaleziono pojazdu" });
        }

        res.json(updatedVehicle);
    } catch (error) {
        console.error("Blad rezerwacji pojazdu:", error);
        res.status(500).json({ message: "Nie udalo sie zarezerwowac pojazdu" });
    }
});

module.exports = router;