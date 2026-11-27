import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router';

const getBookingId = (item) => String(item.id ?? item._id);

// SVG Icons
const Icons = {
    Calendar: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle mr-1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    MapPin: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle mr-1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    Search: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    Chevron: ({ open }) => (
        <span className={`inline-block transition-transform duration-200 text-[0.85rem] ${open ? 'rotate-180' : ''}`}>
            ▾
        </span>
    ),
    Car: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.2 1 11.9 1 12.7V16c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
        </svg>
    ),
    Key: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21 2-2 2m-1.5 1.5L16 7l-1.5-1.5-3 3 2 2-1.5 1.5-2-2-4 4a5 5 0 1 1-1.5-1.5l4-4-2-2 1.5-1.5 2 2 3-3-1.5-1.5L17.5 4 19 2.5z" />
        </svg>
    ),
    Clock: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    Check: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
};

// Status badge color helper
const getBadgeClasses = (status) => {
    switch (status) {
        case 'active':
            return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
        case 'upcoming':
            return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
        case 'completed':
            return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
        case 'cancelled':
            return 'bg-red-500/15 text-red-400 border border-red-500/30';
        default:
            return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
    }
};

const getDotClasses = (status) => {
    switch (status) {
        case 'active':
            return 'bg-emerald-400';
        case 'upcoming':
            return 'bg-blue-400';
        case 'completed':
            return 'bg-slate-400';
        case 'cancelled':
            return 'bg-red-400';
        default:
            return 'bg-slate-400';
    }
};

// Stat cards config
const statCards = [
    { key: 'total', label: 'Total Orders', Icon: Icons.Car },
    { key: 'active', label: 'Active Now', Icon: Icons.Key },
    { key: 'upcoming', label: 'Upcoming', Icon: Icons.Clock }
];

// Tab config
const tabs = [
    { key: 'all', label: 'All', stat: 'total' },
    { key: 'active', label: 'Active', stat: 'active' },
    { key: 'upcoming', label: 'Upcoming', stat: 'upcoming' }
];

function MyBookings() {
    const [bookings, setBookings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [notice, setNotice] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [returningId, setReturningId] = useState(null);

    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const response = await fetch('/api/bookings/my', { credentials: 'include' });
            if (response.status === 401) {
                throw new Error('Please sign in to view your bookings.');
            }
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to load bookings.');
            }
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
                setBookings(null);
                return;
            }

            // Usuń zakończone ('completed') oraz wszystkie anulowane ('cancelled') przy ładowaniu/odświeżeniu strony
            const visibleBookings = data.filter(
                (item) => item.status !== 'completed' && item.status !== 'cancelled'
            );

            setBookings(visibleBookings.length > 0 ? visibleBookings : null);
        } catch (err) {
            setFetchError(err.message || 'Error connecting to the server.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleReturnBooking = async (bookingId) => {
        if (!window.confirm(`Are you sure you want to return the vehicle for reservation #${bookingId}?`)) {
            return;
        }
        setReturningId(bookingId);
        setNotice(null);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/return`, {
                method: 'PATCH',
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to return vehicle.');
            }
            // Zakończone wypożyczenie usuwamy od razu z widoku
            setBookings((prev) => {
                if (!prev) return null;
                const remaining = prev.filter((b) => getBookingId(b) !== String(bookingId));
                return remaining.length > 0 ? remaining : null;
            });
            setNotice({ type: 'success', text: `Vehicle for reservation #${bookingId} has been successfully returned.` });
        } catch (err) {
            setNotice({ type: 'error', text: err.message || 'Failed to return vehicle.' });
        } finally {
            setReturningId(null);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm(`Are you sure you want to cancel reservation #${bookingId}?`)) {
            return;
        }
        setCancellingId(bookingId);
        setNotice(null);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: 'PATCH',
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel reservation.');
            }

            // Zostaw pozycję na ekranie — zniknie dopiero po odświeżeniu strony
            setBookings((prev) => {
                if (!prev) return null;
                return prev.map((b) =>
                    getBookingId(b) === String(bookingId)
                        ? { ...b, status: 'cancelled', statusLabel: 'Cancelled', paymentStatus: 'Refunded' }
                        : b
                );
            });
            setNotice({ type: 'success', text: `Reservation #${bookingId} has been cancelled. It will disappear after refreshing the page.` });
        } catch (err) {
            setNotice({ type: 'error', text: err.message || 'Failed to cancel reservation.' });
        } finally {
            setCancellingId(null);
        }
    };

    const handleToggleExpand = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const stats = useMemo(() => {
        if (!bookings || !Array.isArray(bookings)) {
            return { total: 0, active: 0, upcoming: 0 };
        }
        return {
            total: bookings.length,
            active: bookings.filter((b) => b.status === 'active').length,
            upcoming: bookings.filter((b) => b.status === 'upcoming').length
        };
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        if (!bookings || !Array.isArray(bookings)) {
            return [];
        }
        const query = searchQuery.trim().toLowerCase();
        return bookings.filter((b) => {
            const matchesTab = activeTab === 'all' ? true : b.status === activeTab;
            const matchesSearch =
                query === '' ||
                (b.carName && b.carName.toLowerCase().includes(query)) ||
                (b.id && String(b.id).toLowerCase().includes(query)) ||
                (b.plate && b.plate.toLowerCase().includes(query)) ||
                (b.pickupLocation && b.pickupLocation.toLowerCase().includes(query)) ||
                (b.returnLocation && b.returnLocation.toLowerCase().includes(query));
            return matchesTab && matchesSearch;
        });
    }, [bookings, activeTab, searchQuery]);

    const handleActionClick = (message) => {
        setNotice({ type: 'info', text: message });
    };

    return (
        <main className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-12">
            {/* Header */}
            <div className="mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                        My <span className="text-blue-500">Bookings</span>
                    </h1>
                    <p className="mt-2 text-slate-400 text-base max-w-xl">
                        Manage your active vehicle rentals, review past orders, and view documents.
                    </p>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {statCards.map(({ key, label, Icon }) => (
                    <div key={key} className="flex items-center gap-3 bg-[#151e32] border border-white/[0.08] rounded-xl px-5 py-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                            <Icon />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{stats[key]}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Notice alert */}
            {notice && (
                <div className={`flex items-center justify-between gap-3 mb-6 px-5 py-3 rounded-xl text-sm font-medium ${
                    notice.type === 'error'
                        ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                }`}>
                    <span>{typeof notice === 'string' ? notice : notice.text}</span>
                    <button
                        type="button"
                        className="text-current opacity-60 hover:opacity-100 transition-opacity text-lg leading-none cursor-pointer bg-transparent border-none"
                        onClick={() => setNotice(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Toolbar: Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-5 border-b border-white/[0.08]">
                <div className="flex flex-wrap gap-1.5">
                    {tabs.map(({ key, label, stat }) => (
                        <button
                            key={key}
                            type="button"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer border-none ${
                                activeTab === key
                                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                                    : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200'
                            }`}
                            onClick={() => setActiveTab(key)}
                        >
                            <span>{label}</span>
                            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-xs font-bold ${
                                activeTab === key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-white/[0.06] text-slate-500'
                            }`}>
                                {stats[stat]}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                        <Icons.Search />
                    </span>
                    <input
                        type="text"
                        className="w-full md:w-64 pl-9 pr-9 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                        placeholder="Search by car, city or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 bg-transparent border-none cursor-pointer text-sm"
                            onClick={() => setSearchQuery('')}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Content: Loading / Error / Cards / Empty */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 rounded-full border-[3px] border-blue-500/20 border-t-blue-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Loading your reservations...</p>
                </div>
            ) : fetchError ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <p className="text-red-400 text-sm">{fetchError}</p>
                    <button
                        type="button"
                        className="px-5 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer border-none"
                        onClick={fetchBookings}
                    >
                        Retry
                    </button>
                </div>
            ) : bookings && filteredBookings.length > 0 ? (
                <div className="flex flex-col gap-5">
                    {filteredBookings.map((item) => {
                        const bookingKey = getBookingId(item);
                        const isExpanded = expandedIds.has(bookingKey);
                        const hasDetails = item.details && (
                            item.details.insurance ||
                            item.details.deposit ||
                            item.details.mileage ||
                            (Array.isArray(item.details.extras) && item.details.extras.length > 0) ||
                            item.details.support
                        );

                        return (
                            <div key={bookingKey} className="bg-[#151e32] border border-white/[0.08] rounded-xl shadow-lg overflow-hidden transition-shadow duration-200 hover:shadow-xl hover:shadow-black/20">
                                {/* Card header */}
                                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-white font-mono">#{item.id ?? item._id}</span>
                                        {item.createdAt && (
                                            <span className="text-xs text-slate-500">Booked on {item.createdAt}</span>
                                        )}
                                    </div>
                                    {item.status && (
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClasses(item.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${getDotClasses(item.status)}`} />
                                            <span>{item.statusLabel || item.status}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Main card content */}
                                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr_200px] gap-5 p-5">
                                    {/* Vehicle info */}
                                    <div className="flex items-start gap-4">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.carName || 'Vehicle'}
                                                className="w-24 h-16 rounded-lg object-cover border border-white/[0.08] shrink-0"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        )}
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-base font-bold text-white leading-tight">{item.carName || 'Vehicle'}</h3>
                                            {(item.category || item.plate) && (
                                                <span className="text-xs text-slate-400">
                                                    {[item.category, item.plate].filter(Boolean).join(' • ')}
                                                </span>
                                            )}
                                            {Array.isArray(item.specs) && item.specs.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {item.specs.map((spec, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-block px-2 py-0.5 rounded-md bg-white/[0.05] text-[0.7rem] text-slate-400 border border-white/[0.06]"
                                                        >
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Itinerary */}
                                    <div className="flex flex-col gap-3 justify-center">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[0.65rem] uppercase tracking-widest text-slate-500 font-semibold">Pick-up</span>
                                            {item.pickupDate && (
                                                <span className="flex items-center text-sm text-slate-300">
                                                    <Icons.Calendar />
                                                    {item.pickupDate}
                                                </span>
                                            )}
                                            {item.pickupLocation && (
                                                <span className="flex items-center text-xs text-slate-400">
                                                    <Icons.MapPin />
                                                    {item.pickupLocation}
                                                </span>
                                            )}
                                        </div>

                                        {item.duration && (
                                            <div className="self-start px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold">
                                                Rental duration: {item.duration}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[0.65rem] uppercase tracking-widest text-slate-500 font-semibold">Drop-off</span>
                                            {item.returnDate && (
                                                <span className="flex items-center text-sm text-slate-300">
                                                    <Icons.Calendar />
                                                    {item.returnDate}
                                                </span>
                                            )}
                                            {item.returnLocation && (
                                                <span className="flex items-center text-xs text-slate-400">
                                                    <Icons.MapPin />
                                                    {item.returnLocation}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="flex flex-row items-center gap-3 md:col-span-2 lg:col-span-1 lg:flex-col lg:items-end lg:justify-center">
                                        {item.dailyRate && (
                                            <span className="text-xs text-slate-400">{item.dailyRate} / day</span>
                                        )}
                                        {item.totalPrice && (
                                            <div className="text-xl font-extrabold text-white">{item.totalPrice}</div>
                                        )}
                                        {item.paymentStatus && (
                                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                                                item.status === 'cancelled'
                                                    ? 'bg-amber-500/10 text-amber-400'
                                                    : 'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                                {item.paymentStatus}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-white/[0.06] bg-white/[0.015]">
                                    {hasDetails ? (
                                        <button
                                            type="button"
                                            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer font-medium"
                                            onClick={() => handleToggleExpand(bookingKey)}
                                        >
                                            <span>{isExpanded ? 'Hide details' : 'View details'}</span>
                                            <Icons.Chevron open={isExpanded} />
                                        </button>
                                    ) : <div />}

                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                        {item.status === 'active' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={returningId === bookingKey}
                                                    onClick={() => handleReturnBooking(bookingKey)}
                                                >
                                                    {returningId === bookingKey ? 'Returning...' : 'Return vehicle'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg bg-white/[0.06] text-slate-300 text-sm font-semibold hover:bg-white/[0.1] transition-colors cursor-pointer border border-white/[0.08]"
                                                    onClick={() => handleActionClick(`Extension request sent for #${bookingKey}.`)}
                                                >
                                                    Extend rental
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg bg-white/[0.06] text-slate-300 text-sm font-semibold hover:bg-white/[0.1] transition-colors cursor-pointer border border-white/[0.08]"
                                                    onClick={() => handleActionClick(`Rental pass for #${bookingKey} generated.`)}
                                                >
                                                    Digital Key Pass
                                                </button>
                                            </>
                                        )}

                                        {item.status === 'upcoming' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg bg-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors cursor-pointer border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={cancellingId === bookingKey}
                                                    onClick={() => handleCancelBooking(bookingKey)}
                                                >
                                                    {cancellingId === bookingKey ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg bg-white/[0.06] text-slate-300 text-sm font-semibold hover:bg-white/[0.1] transition-colors cursor-pointer border border-white/[0.08]"
                                                    onClick={() => handleActionClick(`Modify window opened for #${bookingKey}.`)}
                                                >
                                                    Modify dates
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer border-none"
                                                    onClick={() => handleActionClick(`Voucher PDF for #${bookingKey} downloaded.`)}
                                                >
                                                    Download voucher
                                                </button>
                                            </>
                                        )}

                                        {item.status === 'cancelled' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg bg-white/[0.06] text-slate-300 text-sm font-semibold hover:bg-white/[0.1] transition-colors cursor-pointer border border-white/[0.08]"
                                                    onClick={() => handleActionClick(`Refund receipt for #${bookingKey} downloaded.`)}
                                                >
                                                    Receipt
                                                </button>
                                                <Link
                                                    to="/fleet"
                                                    className="inline-block px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors no-underline"
                                                >
                                                    Browse fleet
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable details */}
                                {isExpanded && hasDetails && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-5 py-5 border-t border-white/[0.06] bg-[#0d1526]">
                                        {(item.details.insurance || item.details.deposit) && (
                                            <div>
                                                <h4 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Insurance</h4>
                                                {item.details.insurance && <p className="text-sm text-slate-300">{item.details.insurance}</p>}
                                                {item.details.deposit && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Deposit: <strong className="text-slate-400">{item.details.deposit}</strong>
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {item.details.mileage && (
                                            <div>
                                                <h4 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Mileage policy</h4>
                                                <p className="text-sm text-slate-300">{item.details.mileage}</p>
                                            </div>
                                        )}

                                        {Array.isArray(item.details.extras) && item.details.extras.length > 0 && (
                                            <div>
                                                <h4 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Included options</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.details.extras.map((extra, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-xs text-slate-400 border border-white/[0.06]">
                                                            {extra}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {item.details.support && (
                                            <div>
                                                <h4 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Emergency contact</h4>
                                                <p className="text-sm text-slate-300">{item.details.support}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Questions?{' '}
                                                    <Link to="/contact" className="text-blue-500 hover:text-blue-400 transition-colors">
                                                        Contact support
                                                    </Link>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-500">
                        <Icons.Car />
                    </div>
                    <h3 className="text-lg font-bold text-white">No bookings yet</h3>
                    <p className="text-sm text-slate-400 max-w-md">
                        {searchQuery
                            ? `No reservation matches your search "${searchQuery}".`
                            : "You don't have any bookings in our database yet. Choose a car from our fleet and hit the road!"}
                    </p>
                    <div>
                        <Link
                            to="/booking"
                            className="inline-block px-6 py-3 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-colors no-underline shadow-lg shadow-blue-500/25"
                        >
                            Book a car now
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}

export default MyBookings;