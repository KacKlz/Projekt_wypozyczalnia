const mongoose = require("mongoose");
const dns = require("dns");

require("dotenv").config();

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

const User = require("../models/User");
const Booking = require("../models/Booking");

async function seedBookings() {
    try {
        if (!process.env.MONGO_URI) {
            console.error("Brak MONGO_URI w pliku .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Polaczono z baza MongoDB");

        // Find the user to assign bookings to (prefer user, or admin, or first user)
        const user = await User.findOne({ role: "user" }) || await User.findOne();

        if (!user) {
            console.error("Nie znaleziono zadnego uzytkownika w bazie. Zarejestruj najpierw konto.");
            process.exit(1);
        }

        console.log(`Tworzenie rezerwacji dla uzytkownika: ${user.email} (${user._id})`);

        const sampleBookings = [
            {
                userId: user._id,
                bookingNumber: "BK-2026-8941",
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
                userId: user._id,
                bookingNumber: "BK-2026-9214",
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
                userId: user._id,
                bookingNumber: "BK-2026-7810",
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

        for (const item of sampleBookings) {
            const exists = await Booking.findOne({ bookingNumber: item.bookingNumber, userId: user._id });
            if (!exists) {
                await Booking.create(item);
                console.log(`Dodano rezerwacje: ${item.bookingNumber} (${item.carName})`);
            } else {
                console.log(`Rezerwacja ${item.bookingNumber} juz istnieje dla tego uzytkownika`);
            }
        }

        console.log("Pomyslnie zakonczono dodawanie przykladowych rezerwacji");
        process.exit(0);
    } catch (error) {
        console.error("Blad podczas dodawania rezerwacji:", error);
        process.exit(1);
    }
}

seedBookings();
