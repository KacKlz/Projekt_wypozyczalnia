const express = require("express");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Helper to format a booking - returns actual database values or null if missing
function formatBooking(doc) {
    if (!doc) return null;

    const formattedCreated = doc.createdAt
        ? new Date(doc.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric"
          })
        : null;

    const vehicle = doc.vehicleId && typeof doc.vehicleId === "object" ? doc.vehicleId : null;

    const carName = doc.carName || (vehicle ? `${vehicle.make} ${vehicle.model}` : null);
    const dailyRate = doc.dailyRate || (vehicle && vehicle.daily_rate ? `${vehicle.daily_rate} PLN` : null);

    const vehicleSpecs = vehicle
        ? [
              vehicle.fuel_type || null,
              vehicle.doors ? `${vehicle.doors} doors` : null,
              vehicle.avg_fuel_consumption ? `${vehicle.avg_fuel_consumption} L/100km` : null,
              vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : null
          ].filter(Boolean)
        : null;

    const specs = Array.isArray(doc.specs) && doc.specs.length > 0
        ? doc.specs
        : (vehicleSpecs && vehicleSpecs.length > 0 ? vehicleSpecs : null);

    const hasDetails = doc.details && (
        doc.details.insurance ||
        doc.details.deposit ||
        doc.details.mileage ||
        (Array.isArray(doc.details.extras) && doc.details.extras.length > 0) ||
        doc.details.support
    );

    return {
        id: doc.bookingNumber || (doc._id ? doc._id.toString() : null),
        _id: doc._id || null,
        vehicleId: vehicle ? vehicle._id : (doc.vehicleId || null),
        createdAt: formattedCreated,
        carName,
        category: doc.category || (vehicle?.fuel_type || null),
        plate: doc.plate || null,
        image: doc.image || null,
        status: doc.status || null,
        statusLabel: doc.statusLabel || (
            doc.status === "active" ? "Active" :
            doc.status === "upcoming" ? "Confirmed" :
            doc.status === "completed" ? "Completed" :
            doc.status === "cancelled" ? "Cancelled" : null
        ),
        pickupDate: doc.pickupDate || null,
        pickupLocation: doc.pickupLocation || null,
        returnDate: doc.returnDate || null,
        returnLocation: doc.returnLocation || null,
        duration: doc.duration || null,
        dailyRate,
        totalPrice: doc.totalPrice || null,
        paymentStatus: doc.paymentStatus || null,
        specs,
        details: hasDetails
            ? {
                  insurance: doc.details.insurance || null,
                  deposit: doc.details.deposit || null,
                  mileage: doc.details.mileage || (vehicle?.mileage ? `${vehicle.mileage.toLocaleString()} km` : null),
                  extras: Array.isArray(doc.details.extras) && doc.details.extras.length > 0 ? doc.details.extras : null,
                  support: doc.details.support || null
              }
            : null
    };
}

// GET /api/bookings/my - Fetch current user's bookings from database (returns null if empty)
router.get("/my", authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.userId })
            .populate("vehicleId")
            .sort({ createdAt: -1 });

        // If no bookings exist in the database, return null
        if (!bookings || bookings.length === 0) {
            return res.json(null);
        }

        return res.json(bookings.map(formatBooking));
    } catch (error) {
        console.error("Blad pobierania rezerwacji:", error);
        return res.status(500).json({ message: "Blad serwera podczas pobierania rezerwacji" });
    }
});

// PATCH /api/bookings/:id/cancel - Cancel an existing booking
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
    try {
        const identifier = req.params.id;

        const booking = await Booking.findOne({
            userId: req.userId,
            $or: [
                { bookingNumber: identifier },
                ...(identifier.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: identifier }] : [])
            ]
        });

        if (!booking) {
            return res.status(404).json({ message: "Rezerwacja nie zostala znaleziona" });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ message: "Ta rezerwacja jest juz anulowana" });
        }

        if (booking.status === "completed") {
            return res.status(400).json({ message: "Nie mozna anulowac zakonczonej rezerwacji" });
        }

        booking.status = "cancelled";
        booking.statusLabel = "Cancelled";
        booking.paymentStatus = "Refunded";
        await booking.save();

        // Release the vehicle back to available status (is_rented: false)
        try {
            if (booking.vehicleId) {
                await Vehicle.findByIdAndUpdate(booking.vehicleId, { $set: { is_rented: false } });
            } else if (booking.carName) {
                const words = booking.carName.trim().split(" ");
                if (words.length >= 2) {
                    await Vehicle.findOneAndUpdate(
                        {
                            make: new RegExp(`^${words[0]}$`, "i"),
                            model: new RegExp(`^${words.slice(1).join(" ")}$`, "i")
                        },
                        { $set: { is_rented: false } }
                    );
                }
            }
        } catch (vehicleErr) {
            console.warn("Nie udalo sie zwolnic pojazdu przy anulowaniu:", vehicleErr);
        }

        return res.json({
            message: "Rezerwacja zostala anulowana",
            booking: formatBooking(booking)
        });
    } catch (error) {
        console.error("Blad anulowania rezerwacji:", error);
        return res.status(500).json({ message: "Blad serwera podczas anulowania rezerwacji" });
    }
});

// PATCH /api/bookings/:id/return - Return a vehicle (complete the active rental)
router.patch("/:id/return", authMiddleware, async (req, res) => {
    try {
        const identifier = req.params.id;

        const booking = await Booking.findOne({
            userId: req.userId,
            $or: [
                { bookingNumber: identifier },
                ...(identifier.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: identifier }] : [])
            ]
        });

        if (!booking) {
            return res.status(404).json({ message: "Rezerwacja nie zostala znaleziona" });
        }

        if (booking.status === "completed") {
            return res.status(400).json({ message: "To wypozyczenie zostalo juz zakonczone" });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ message: "Nie mozna zwrocic anulowanej rezerwacji" });
        }

        booking.status = "completed";
        booking.statusLabel = "Completed";
        if (!booking.paymentStatus || booking.paymentStatus === "Paid Online") {
            booking.paymentStatus = "Settled & Invoiced";
        }
        await booking.save();

        // Release the vehicle back to available status (is_rented: false)
        try {
            if (booking.vehicleId) {
                await Vehicle.findByIdAndUpdate(booking.vehicleId, { $set: { is_rented: false } });
            } else if (booking.carName) {
                const words = booking.carName.trim().split(" ");
                if (words.length >= 2) {
                    await Vehicle.findOneAndUpdate(
                        {
                            make: new RegExp(`^${words[0]}$`, "i"),
                            model: new RegExp(`^${words.slice(1).join(" ")}$`, "i")
                        },
                        { $set: { is_rented: false } }
                    );
                }
            }
        } catch (vehicleErr) {
            console.warn("Nie udalo sie zaktualizowac statusu pojazdu:", vehicleErr);
        }

        return res.json({
            message: "Pojazd zostal pomyslnie zwrocony. Wypozyczenie zakonczone.",
            booking: formatBooking(booking)
        });
    } catch (error) {
        console.error("Blad oddawania pojazdu:", error);
        return res.status(500).json({ message: "Blad serwera podczas oddawania pojazdu" });
    }
});

module.exports = router;
