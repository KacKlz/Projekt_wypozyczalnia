import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const API_URL = 'http://localhost:3001/api/vehicles';
const BODY_TYPES = ['Compact', 'SUV', 'Premium', 'Van / Bus'];
const TRANSMISSIONS = ['Any', 'Automatic', 'Manual'];
const FUEL_TYPES = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
const ITEMS_PER_PAGE = 6;

const DEFAULT_FILTERS = {
    bodyTypes: [],
    transmission: 'Any',
    fuelType: 'All',
    doorsFilter: 'Any',
    maxPrice: 300,
};

function Fleet() {
    const navigate = useNavigate();

    const [selectedBodies, setSelectedBodies] = useState(DEFAULT_FILTERS.bodyTypes);
    const [transmission, setTransmission] = useState(DEFAULT_FILTERS.transmission);
    const [fuelType, setFuelType] = useState(DEFAULT_FILTERS.fuelType);
    const [doorsFilter, setDoorsFilter] = useState(DEFAULT_FILTERS.doorsFilter);
    const [maxPrice, setMaxPrice] = useState(DEFAULT_FILTERS.maxPrice);

    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

    const [sortBy, setSortBy] = useState('price-asc');
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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

    const doorsOptions = useMemo(() => {
        const uniqueDoors = Array.from(
            new Set(
                vehicles
                    .map((v) => Number(v.doors))
                    .filter((d) => Number.isFinite(d) && d > 0)
            )
        ).sort((a, b) => a - b);

        return ['Any', ...uniqueDoors.map(String)];
    }, [vehicles]);

    const toggleBodyType = (type) => {
        setSelectedBodies((prev) =>
            prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
        );
    };

    const handleApplyFilters = (e) => {
        e.preventDefault();
        setAppliedFilters({
            bodyTypes: selectedBodies,
            transmission,
            fuelType,
            doorsFilter,
            maxPrice,
        });
        setCurrentPage(1);
    };

    const filteredAndSortedVehicles = useMemo(() => {
        const normalizedBodies = appliedFilters.bodyTypes.map((b) => b.toLowerCase());

        const filtered = vehicles.filter((vehicle) => {
            const vehicleBody = (vehicle.body_type || vehicle.bodyType || '').toLowerCase();
            const vehicleTransmission = (vehicle.transmission || '').toLowerCase();
            const vehicleFuel = (vehicle.fuel_type || '').toLowerCase();
            const vehicleDoors = Number(vehicle.doors ?? 0);
            const vehiclePrice = Number(vehicle.daily_rate ?? 0);

            const matchesBody =
                normalizedBodies.length === 0 || normalizedBodies.includes(vehicleBody);

            const matchesTransmission =
                appliedFilters.transmission === 'Any' ||
                vehicleTransmission === appliedFilters.transmission.toLowerCase();

            const matchesFuel =
                appliedFilters.fuelType === 'All' ||
                vehicleFuel === appliedFilters.fuelType.toLowerCase();

            const matchesDoors =
                appliedFilters.doorsFilter === 'Any' ||
                vehicleDoors === Number(appliedFilters.doorsFilter);

            const matchesPrice = vehiclePrice <= appliedFilters.maxPrice;

            return (
                matchesBody &&
                matchesTransmission &&
                matchesFuel &&
                matchesDoors &&
                matchesPrice
            );
        });

        return [...filtered].sort((a, b) => {
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
    }, [vehicles, appliedFilters, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSortedVehicles.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const paginatedVehicles = filteredAndSortedVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                            onClick={() => navigate('/booking')}
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

                <div className="rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-xl">
                    <h2 className="mb-5 text-xl font-semibold text-white">
                        Search Vehicle
                    </h2>

                    <div className="mb-4 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-300">
                            Location
                        </label>
                        <select className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-blue-500">
                            <option>Warsaw</option>
                            <option>Krakow</option>
                            <option>Gdansk</option>
                        </select>
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-300">
                                Pickup Date
                            </label>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-300">
                                Return Date
                            </label>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            document
                                .getElementById('fleet-section')
                                ?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className="w-full cursor-pointer rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                    >
                        Search Vehicles
                    </button>
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
                            : `Found ${filteredAndSortedVehicles.length} vehicles`}
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
                    <aside className="rounded-2xl border border-white/10 bg-[#111827] p-5">
                        <h3 className="mb-4 text-lg font-semibold text-white">Filters</h3>

                        <form onSubmit={handleApplyFilters} className="space-y-5">
                            <div className="space-y-0.5">
                                <span className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                    Body type
                                </span>
                                {BODY_TYPES.map((type) => {
                                    const checked = selectedBodies.includes(type);
                                    return (
                                        <label
                                            key={type}
                                            className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                                        >
                                            <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleBodyType(type)}
                                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-[5px] border border-slate-600 bg-[#0b1120] transition checked:border-blue-500 checked:bg-blue-500 group-hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                                />
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                                                >
                                                    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                                                </svg>
                                            </span>
                                            <span className={checked ? 'font-medium text-white' : ''}>
                                                {type}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="space-y-0.5 border-t border-white/10 pt-4">
                                <span className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                    Transmission
                                </span>
                                {TRANSMISSIONS.map((item) => {
                                    const checked = transmission === item;
                                    return (
                                        <label
                                            key={item}
                                            className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                                        >
                                            <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name="transmission"
                                                    checked={checked}
                                                    onChange={() => setTransmission(item)}
                                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-slate-600 bg-[#0b1120] transition checked:border-blue-500 group-hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                                />
                                                <span className="pointer-events-none absolute h-2 w-2 scale-0 rounded-full bg-blue-500 transition-transform peer-checked:scale-100" />
                                            </span>
                                            <span className={checked ? 'font-medium text-white' : ''}>
                                                {item}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="space-y-1.5 border-t border-white/10 pt-4">
                                <label
                                    htmlFor="fleet-fuel"
                                    className="block text-xs font-semibold tracking-wider text-slate-400 uppercase"
                                >
                                    Fuel
                                </label>
                                <select
                                    id="fleet-fuel"
                                    value={fuelType}
                                    onChange={(e) => setFuelType(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-[#0b1120] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
                                >
                                    {FUEL_TYPES.map((fuel) => (
                                        <option key={fuel} value={fuel}>
                                            {fuel}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5 border-t border-white/10 pt-4">
                                <label
                                    htmlFor="fleet-doors"
                                    className="block text-xs font-semibold tracking-wider text-slate-400 uppercase"
                                >
                                    Doors
                                </label>
                                <select
                                    id="fleet-doors"
                                    value={doorsFilter}
                                    onChange={(e) => setDoorsFilter(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-[#0b1120] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
                                >
                                    {doorsOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option === 'Any' ? 'Any' : `${option} doors`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 border-t border-white/10 pt-4">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="fleet-max-price"
                                        className="text-xs font-semibold tracking-wider text-slate-400 uppercase"
                                    >
                                        Max price / day
                                    </label>
                                    <span className="text-xs font-semibold text-blue-400">
                                        {maxPrice} PLN
                                    </span>
                                </div>
                                <input
                                    id="fleet-max-price"
                                    type="range"
                                    min={20}
                                    max={300}
                                    step={5}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full cursor-pointer accent-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full cursor-pointer rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                            >
                                Apply Filters
                            </button>
                        </form>
                    </aside>

                    <div className="min-w-0">
                        {error && (
                            <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-6 text-center text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {!loading && !error && filteredAndSortedVehicles.length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-[#111827] p-8 text-center text-sm text-slate-400">
                                No vehicles found.
                            </div>
                        )}

                        {!loading && !error && filteredAndSortedVehicles.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {paginatedVehicles.map((vehicle) => (
                                        <article
                                            key={vehicle._id}
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
                                                        disabled={vehicle.is_rented}
                                                        onClick={() =>
                                                            navigate('/booking', {
                                                                state: { vehicle },
                                                            })
                                                        }
                                                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                                            vehicle.is_rented
                                                                ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                                                                : 'cursor-pointer bg-blue-500 text-white hover:bg-blue-400'
                                                        }`}
                                                    >
                                                        {vehicle.is_rented ? 'Unavailable' : 'Book'}
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
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