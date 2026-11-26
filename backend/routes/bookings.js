const express = require("express");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Helper to format a booking for frontend consumption
function formatBooking(doc) {
    const formattedCreated = doc.createdAt
        ? new Date(doc.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric"
          })
        : "";

    return {
        id: doc.bookingNumber || doc._id.toString(),
        _id: doc._id,
        createdAt: formattedCreated,
        carName: doc.carName,
        category: doc.category,
        plate: doc.plate,
        image: doc.image,
        status: doc.status,
        statusLabel: doc.statusLabel || (
            doc.status === "active" ? "Active" :
            doc.status === "upcoming" ? "Confirmed" :
            doc.status === "completed" ? "Completed" : "Cancelled"
        ),
        pickupDate: doc.pickupDate,
        pickupLocation: doc.pickupLocation,
        returnDate: doc.returnDate,
        returnLocation: doc.returnLocation,
        duration: doc.duration,
        dailyRate: doc.dailyRate,
        totalPrice: doc.totalPrice,
        paymentStatus: doc.paymentStatus,
        specs: doc.specs || [],
        details: {
            insurance: (doc.details && doc.details.insurance) || "Standard Cover",
            deposit: (doc.details && doc.details.deposit) || "1 500 PLN",
            mileage: (doc.details && doc.details.mileage) || "Unlimited",
            extras: (doc.details && doc.details.extras) || [],
            support: (doc.details && doc.details.support) || "+48 22 100 20 30"
        }
    };
}

// GET /api/bookings/my - Fetch current user's bookings
router.get("/my", authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });
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

        return res.json({
            message: "Rezerwacja zostala anulowana",
            booking: formatBooking(booking)
        });
    } catch (error) {
        console.error("Blad anulowania rezerwacji:", error);
        return res.status(500).json({ message: "Blad serwera podczas anulowania rezerwacji" });
    }
});

// POST /api/bookings/seed-sample - Populate sample bookings for current user for testing
router.post("/seed-sample", authMiddleware, async (req, res) => {
    try {
        const sampleBookings = [
            {
                userId: req.userId,
                bookingNumber: `BK-${new Date().getFullYear()}-8941`,
                carName: "BMW M3 Competition",
                category: "Sports Sedan",
                plate: "WA 89342",
                image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=700&q=80",
                status: "active",
                statusLabel: "Active",
                pickupDate: "18 Nov 2026, 10:00",
                pickupLocation: "Warsaw Chopin Airport (WAW)",
                returnDate: "23 Nov 2026, 18:00",
                returnLocation: "Warsaw City Center (Złota 44)",
                duration: "5 days",
                dailyRate: "480 PLN",
                totalPrice: "2 400 PLN",
                paymentStatus: "Paid Online",
                specs: ["Automatic", "Petrol 510 HP", "5 Seats"],
                details: {
                    insurance: "Full Comprehensive Cover (0 PLN Deductible)",
                    deposit: "1 500 PLN (Pre-authorized on card)",
                    mileage: "Unlimited kilometers",
                    extras: ["GPS Navigation", "Additional Driver", "Full-to-Full fuel"],
                    support: "+48 22 100 20 30"
                }
            },
            {
                userId: req.userId,
                bookingNumber: `BK-${new Date().getFullYear()}-9214`,
                carName: "Porsche 911 Carrera 4S",
                category: "Supercar",
                plate: "KR 5510P",
                image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=700&q=80",
                status: "upcoming",
                statusLabel: "Confirmed",
                pickupDate: "28 Nov 2026, 12:00",
                pickupLocation: "Krakow Balice Airport (KRK)",
                returnDate: "01 Dec 2026, 16:00",
                returnLocation: "Krakow Balice Airport (KRK)",
                duration: "3 days",
                dailyRate: "950 PLN",
                totalPrice: "2 850 PLN",
                paymentStatus: "Paid Online",
                specs: ["PDK Automatic", "Petrol 450 HP", "4 Seats"],
                details: {
                    insurance: "Premium Track & Road Shield",
                    deposit: "3 000 PLN (Pre-authorized)",
                    mileage: "900 km included (2.50 PLN/km extra)",
                    extras: ["Sport Chrono Package", "24/7 Roadside Assistance"],
                    support: "+48 12 300 40 50"
                }
            },
            {
                userId: req.userId,
                bookingNumber: `BK-${new Date().getFullYear()}-7810`,
                carName: "Audi RS6 Avant",
                category: "Performance Estate",
                plate: "WI 1148A",
                image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=700&q=80",
                status: "completed",
                statusLabel: "Completed",
                pickupDate: "10 Oct 2026, 09:00",
                pickupLocation: "Gdansk Lech Walesa Airport (GDN)",
                returnDate: "16 Oct 2026, 15:00",
                returnLocation: "Gdansk Downtown Hub",
                duration: "6 days",
                dailyRate: "620 PLN",
                totalPrice: "3 720 PLN",
                paymentStatus: "Settled & Invoiced",
                specs: ["Tiptronic 8-spd", "Mild Hybrid 600 HP", "5 Seats"],
                details: {
                    insurance: "Full Protection Package",
                    deposit: "Released back to card on 17 Oct",
                    mileage: "Unlimited kilometers",
                    extras: ["Ski Roof Box", "Winter Tires Set"],
                    support: "+48 58 200 10 20"
                }
            }
        ];

        const created = [];
        for (const sample of sampleBookings) {
            const exists = await Booking.findOne({ bookingNumber: sample.bookingNumber, userId: req.userId });
            if (!exists) {
                const doc = await Booking.create(sample);
                created.push(doc);
            }
        }

        const allUserBookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });
        return res.status(201).json({
            message: `Dodano ${created.length} przykladowe rezerwacje`,
            bookings: allUserBookings.map(formatBooking)
        });
    } catch (error) {
        console.error("Blad dodawania przykladowych rezerwacji:", error);
        return res.status(500).json({ message: "Blad serwera" });
    }
});

module.exports = router;
