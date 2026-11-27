import { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:3001/api/vehicles';
const ITEMS_PER_PAGE = 6;

function Fleet() {
    const [sortBy, setSortBy] = useState('price-asc');
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingError, setBookingError] = useState('');
    const [bookingId, setBookingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchVehicles() {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(API_URL, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('Failed to load vehicles');
                }
                const data = await response.json();
                const list = Array.isArray(data) ? data : [];
                setVehicles(list);
                setCurrentPage(1);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError('Could not load vehicles from the server.');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchVehicles();
        return () => controller.abort();
    }, []);

    const handleBookVehicle = async (vehicle) => {
        const vehicleId = vehicle._id ?? vehicle.id;
        if (vehicle.is_rented || bookingId === vehicleId) return;

        setBookingId(vehicleId);
        setBookingError('');

        try {
            const token =
                localStorage.getItem('token') ||
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('token');

            const response = await fetch(`${API_URL}/${vehicleId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ is_rented: true }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message || `HTTP ${response.status}`);
            }

            setVehicles((prev) =>
                prev.map((item) => {
                    const itemId = item._id ?? item.id;
                    return itemId === vehicleId
                        ? { ...item, ...(data || {}), is_rented: true }
                        : item;
                })
            );
        } catch (err) {
            console.error('Booking error:', err);
            setBookingError(err.message || 'Could not reserve the vehicle.');
        } finally {
            setBookingId(null);
        }
    };
    
    const sortedVehicles = useMemo(() => {
        return [...vehicles].sort((a, b) => {
            if (sortBy === 'price-asc') {
                return Number(a.daily_rate) - Number(b.daily_rate);
            }
            if (sortBy === 'price-desc') {
                return Number(b.daily_rate) - Number(a.daily_rate);
            }
            if (sortBy === 'name-asc') {
                const nameA = `${a.make} ${a.model}`.toLowerCase();
                const nameB = `${b.make} ${b.model}`.toLowerCase();
                return nameA.localeCompare(nameB);
            }
            return 0;
        });
    }, [vehicles, sortBy]);

    const totalPages = Math.max(1, Math.ceil(sortedVehicles.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const paginatedVehicles = sortedVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        document.getElementById('fleet-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 text-[#f8fafc]">
            <section className="grid grid-cols-1 items-center gap-10 pb-16 lg:grid-cols-2">
                <div className="space-y-5">
                    <span className="inline-block text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">
                        PREMIUM CAR RENTAL
                    </span>

                    <h1 className="text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl">
                        Find the perfect car
                        <br />
                        for your journey
                    </h1>

                    <p className="max-w-lg text-base leading-relaxed text-slate-400">
                        Browse our fleet and choose a vehicle tailored to
                        your travel needs.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() =>
                                document
                                    .getElementById('fleet-section')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }
                            className="cursor-pointer rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                        >
                            Book Now
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                document
                                    .getElementById('fleet-section')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }
                            className="cursor-pointer rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                        >
                            View Fleet
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#111827] p-6 text-sm text-slate-400 shadow-xl">
                    There will be search section
                </div>
            </section>

            <section id="fleet-section" className="pt-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">Our Fleet</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Browse our range of vehicles available for rental.
                    </p>
                </div>

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#111827] px-5 py-3.5">
                    <span className="text-sm font-medium text-slate-300">
                        {loading
                            ? 'Loading vehicles...'
                            : `Found ${sortedVehicles.length} vehicles`}
                    </span>

                    <div className="flex items-center gap-2.5">
                        <label
                            htmlFor="fleet-sort-select"
                            className="text-xs font-medium text-slate-400"
                        >
                            Sort by
                        </label>
                        <select
                            id="fleet-sort-select"
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-slate-700 bg-[#0b1120] px-3 py-1.5 text-sm text-white outline-none transition focus:border-blue-500"
                        >
                            <option value="price-asc">Price: low to high</option>
                            <option value="price-desc">Price: high to low</option>
                            <option value="name-asc">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_1fr]">
                    <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 text-sm text-slate-400">
                        There will be filters section
                    </div>

                    <div className="min-w-0">
                        {bookingError && (
                            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-center text-sm text-red-200">
                                {bookingError}
                            </div>
                        )}

                        {error && (
                            <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-6 text-center text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {!loading && !error && sortedVehicles.length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-[#111827] p-8 text-center text-sm text-slate-400">
                                No vehicles found.
                            </div>
                        )}

                        {!loading && !error && sortedVehicles.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {paginatedVehicles.map((vehicle) => {
                                        const vehicleId = vehicle._id ?? vehicle.id;
                                        const isBookingThis = bookingId === vehicleId;
                                        const isUnavailable = Boolean(vehicle.is_rented) || isBookingThis;

                                        return (
                                            <article
                                                key={vehicleId}
                                                className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111827] transition hover:border-blue-500/40"
                                            >
                                                <div className="flex h-32 items-start justify-between bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            vehicle.is_rented
                                                                ? 'bg-amber-500/15 text-amber-300'
                                                                : 'bg-emerald-500/15 text-emerald-300'
                                                        }`}
                                                    >
                                                        {vehicle.is_rented ? 'Rented' : 'Available'}
                                                    </span>
                                                    <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                                        {vehicle.fuel_type}
                                                    </span>
                                                </div>

                                                <div className="flex flex-1 flex-col p-5">
                                                    <h3 className="text-lg font-bold text-white">
                                                        {vehicle.make} {vehicle.model}
                                                    </h3>

                                                    <p className="mt-1.5 text-xs text-slate-400">
                                                        {vehicle.fuel_type} · {vehicle.doors} doors ·{' '}
                                                        {vehicle.avg_fuel_consumption} L/100km
                                                    </p>

                                                    <p className="mt-2 text-xs text-slate-400">
                                                        Mileage: {vehicle.mileage?.toLocaleString()} km
                                                    </p>

                                                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                                                        <span className="text-lg font-bold text-white">
                                                            {vehicle.daily_rate} PLN{' '}
                                                            <span className="text-xs font-normal text-slate-400">
                                                                / day
                                                            </span>
                                                        </span>

                                                        <button
                                                            type="button"
                                                            disabled={isUnavailable}
                                                            onClick={() => handleBookVehicle(vehicle)}
                                                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                                                isUnavailable
                                                                    ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                                                                    : 'cursor-pointer bg-blue-500 text-white hover:bg-blue-400'
                                                            }`}
                                                        >
                                                            {isBookingThis
                                                                ? 'Booking...'
                                                                : vehicle.is_rented
                                                                    ? 'Unavailable'
                                                                    : 'Book'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                {totalPages > 1 && (
                                    <nav
                                        className="mt-8 flex flex-wrap items-center justify-center gap-2"
                                        aria-label="Fleet pagination"
                                    >
                                        <button
                                            type="button"
                                            disabled={safePage === 1}
                                            onClick={() => handlePageChange(safePage - 1)}
                                            className="cursor-pointer rounded-lg border border-slate-700 bg-[#111827] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Prev
                                        </button>

                                        {Array.from({ length: totalPages }, (_, index) => {
                                            const pageNumber = index + 1;
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    type="button"
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                                                        safePage === pageNumber
                                                            ? 'bg-blue-500 text-white'
                                                            : 'border border-slate-700 bg-[#111827] text-slate-200 hover:bg-slate-800'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            disabled={safePage === totalPages}
                                            onClick={() => handlePageChange(safePage + 1)}
                                            className="cursor-pointer rounded-lg border border-slate-700 bg-[#111827] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Fleet;