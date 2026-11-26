import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import '../../styles/pages/Page.css';
import '../../styles/pages/MyBookings.css';

// SVG Icons harmonized with app typography and style
const Icons = {
    Calendar: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    MapPin: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
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
        <span style={{ display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.85rem' }}>
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

function MyBookings() {
    // Bookings fetched from backend API (/api/bookings/my)
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [notice, setNotice] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [isSeeding, setIsSeeding] = useState(false);

    // Fetch user bookings from backend
    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const response = await fetch('/api/bookings/my');
            if (response.status === 401) {
                throw new Error('Please sign in to view your bookings.');
            }
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to load bookings.');
            }
            const data = await response.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setFetchError(err.message || 'Error connecting to the server.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Cancel booking via backend PATCH /api/bookings/:id/cancel
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm(`Are you sure you want to cancel reservation #${bookingId}?`)) {
            return;
        }

        setCancellingId(bookingId);
        setNotice(null);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: 'PATCH'
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel reservation.');
            }

            // Update local state with cancelled status
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === bookingId || b._id === bookingId
                        ? {
                              ...b,
                              status: 'cancelled',
                              statusLabel: 'Cancelled',
                              paymentStatus: 'Refunded'
                          }
                        : b
                )
            );

            setNotice({
                type: 'success',
                text: `Reservation #${bookingId} has been successfully cancelled.`
            });
        } catch (err) {
            setNotice({
                type: 'error',
                text: err.message || 'Failed to cancel reservation.'
            });
        } finally {
            setCancellingId(null);
        }
    };

    // Helper to seed sample demo bookings in database
    const handleSeedSample = async () => {
        setIsSeeding(true);
        setNotice(null);
        try {
            const response = await fetch('/api/bookings/seed-sample', {
                method: 'POST'
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add sample bookings.');
            }

            if (data.bookings && Array.isArray(data.bookings)) {
                setBookings(data.bookings);
            } else {
                await fetchBookings();
            }

            setNotice({
                type: 'success',
                text: data.message || 'Sample bookings added to your account.'
            });
        } catch (err) {
            setNotice({
                type: 'error',
                text: err.message || 'Failed to generate sample bookings.'
            });
        } finally {
            setIsSeeding(false);
        }
    };

    // Toggle expanded card details
    const handleToggleExpand = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Calculate count stats
    const stats = useMemo(() => {
        return {
            total: bookings.length,
            active: bookings.filter((b) => b.status === 'active').length,
            upcoming: bookings.filter((b) => b.status === 'upcoming').length,
            completed: bookings.filter((b) => b.status === 'completed').length,
            cancelled: bookings.filter((b) => b.status === 'cancelled').length
        };
    }, [bookings]);

    // Filter list by selected tab & search string
    const filteredBookings = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return bookings.filter((b) => {
            const matchesTab = activeTab === 'all' ? true : b.status === activeTab;
            const matchesSearch =
                query === '' ||
                (b.carName && b.carName.toLowerCase().includes(query)) ||
                (b.id && b.id.toLowerCase().includes(query)) ||
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
        <main className="page my-bookings-page">
            {/* Header section */}
            <div className="bookings-header">
                <div className="bookings-header-text">
                    <h1>
                        My <span className="bookings-highlight">Bookings</span>
                    </h1>
                    <p className="bookings-subtitle">
                        Manage your active vehicle rentals, review past orders, and view documents.
                    </p>
                </div>
            </div>

            {/* Quick overview statistics cards */}
            <div className="bookings-stats-grid">
                <div className="bookings-stat-card">
                    <div className="stat-icon-box">
                        <Icons.Car />
                    </div>
                    <div>
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-title">Total Orders</div>
                    </div>
                </div>

                <div className="bookings-stat-card">
                    <div className="stat-icon-box">
                        <Icons.Key />
                    </div>
                    <div>
                        <div className="stat-number">{stats.active}</div>
                        <div className="stat-title">Active Now</div>
                    </div>
                </div>

                <div className="bookings-stat-card">
                    <div className="stat-icon-box">
                        <Icons.Clock />
                    </div>
                    <div>
                        <div className="stat-number">{stats.upcoming}</div>
                        <div className="stat-title">Upcoming</div>
                    </div>
                </div>

                <div className="bookings-stat-card">
                    <div className="stat-icon-box">
                        <Icons.Check />
                    </div>
                    <div>
                        <div className="stat-number">{stats.completed}</div>
                        <div className="stat-title">Completed</div>
                    </div>
                </div>
            </div>

            {/* Notification alert */}
            {notice && (
                <div
                    className={`bookings-alert ${
                        notice.type === 'error' ? 'bookings-alert-error' : ''
                    }`}
                >
                    <span>{typeof notice === 'string' ? notice : notice.text}</span>
                    <button
                        type="button"
                        className="bookings-alert-close"
                        onClick={() => setNotice(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Toolbar (Tabs & Search) */}
            <div className="bookings-toolbar">
                <div className="bookings-tabs">
                    <button
                        type="button"
                        className={`bookings-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        <span>All</span>
                        <span className="tab-badge">{stats.total}</span>
                    </button>
                    <button
                        type="button"
                        className={`bookings-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        <span>Active</span>
                        <span className="tab-badge">{stats.active}</span>
                    </button>
                    <button
                        type="button"
                        className={`bookings-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        <span>Upcoming</span>
                        <span className="tab-badge">{stats.upcoming}</span>
                    </button>
                    <button
                        type="button"
                        className={`bookings-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        <span>Completed</span>
                        <span className="tab-badge">{stats.completed}</span>
                    </button>
                    <button
                        type="button"
                        className={`bookings-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cancelled')}
                    >
                        <span>Cancelled</span>
                        <span className="tab-badge">{stats.cancelled}</span>
                    </button>
                </div>

                <div className="bookings-search-wrapper">
                    <span className="bookings-search-icon">
                        <Icons.Search />
                    </span>
                    <input
                        type="text"
                        className="bookings-search-input"
                        placeholder="Search by car, city or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="bookings-search-clear"
                            onClick={() => setSearchQuery('')}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Loading state */}
            {isLoading ? (
                <div className="bookings-loading-state">
                    <div className="bookings-spinner" />
                    <p>Loading your reservations...</p>
                </div>
            ) : fetchError ? (
                /* Error state */
                <div className="bookings-error-box">
                    <p>{fetchError}</p>
                    <button
                        type="button"
                        className="btn-action-primary"
                        onClick={fetchBookings}
                    >
                        Retry
                    </button>
                </div>
            ) : filteredBookings.length > 0 ? (
                /* Bookings cards stack */
                <div className="bookings-cards-stack">
                    {filteredBookings.map((item) => {
                        const isExpanded = expandedIds.has(item.id);

                        return (
                            <div key={item.id} className="booking-item-card">
                                {/* Card header */}
                                <div className="booking-card-header">
                                    <div className="booking-ref-box">
                                        <span className="booking-ref-number">#{item.id}</span>
                                        {item.createdAt && (
                                            <span className="booking-ref-date">
                                                Booked on {item.createdAt}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`booking-badge ${item.status}`}>
                                        <span className="booking-badge-dot" />
                                        <span>{item.statusLabel}</span>
                                    </div>
                                </div>

                                {/* Main card content */}
                                <div className="booking-card-content">
                                    {/* Left: Vehicle info */}
                                    <div className="vehicle-media-box">
                                        <img
                                            src={item.image}
                                            alt={item.carName}
                                            className="vehicle-thumbnail"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80';
                                            }}
                                        />
                                        <div className="vehicle-heading">
                                            <h3>{item.carName}</h3>
                                            <span className="vehicle-category">
                                                {item.category}
                                                {item.plate ? ` • ${item.plate}` : ''}
                                            </span>
                                            {item.specs && item.specs.length > 0 && (
                                                <div className="vehicle-specs-list">
                                                    {item.specs.map((spec, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="vehicle-spec-pill"
                                                        >
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Middle: Itinerary */}
                                    <div className="rental-route-box">
                                        <div className="rental-route-point">
                                            <span className="rental-point-label">Pick-up</span>
                                            <span className="rental-point-date">
                                                <Icons.Calendar />
                                                {item.pickupDate}
                                            </span>
                                            <span className="rental-point-place">
                                                <Icons.MapPin />
                                                {item.pickupLocation}
                                            </span>
                                        </div>

                                        {item.duration && (
                                            <div className="rental-duration-tag">
                                                Rental duration: {item.duration}
                                            </div>
                                        )}

                                        <div className="rental-route-point">
                                            <span className="rental-point-label">Drop-off</span>
                                            <span className="rental-point-date">
                                                <Icons.Calendar />
                                                {item.returnDate}
                                            </span>
                                            <span className="rental-point-place">
                                                <Icons.MapPin />
                                                {item.returnLocation}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Pricing summary */}
                                    <div className="rental-price-box">
                                        {item.dailyRate && (
                                            <span className="price-rate-label">
                                                {item.dailyRate} / day
                                            </span>
                                        )}
                                        <div className="price-grand-total">{item.totalPrice}</div>
                                        <span
                                            className={`price-payment-state ${
                                                item.status === 'cancelled' ? 'refunded' : ''
                                            }`}
                                        >
                                            {item.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer controls */}
                                <div className="booking-card-footer">
                                    <button
                                        type="button"
                                        className="btn-details-toggle"
                                        onClick={() => handleToggleExpand(item.id)}
                                    >
                                        <span>
                                            {isExpanded ? 'Hide details' : 'View details'}
                                        </span>
                                        <Icons.Chevron open={isExpanded} />
                                    </button>

                                    <div className="booking-actions-group">
                                        {item.status === 'active' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn-action-secondary"
                                                    onClick={() =>
                                                        handleActionClick(
                                                            `Extension request sent for ${item.id}.`
                                                        )
                                                    }
                                                >
                                                    Extend rental
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-action-primary"
                                                    onClick={() =>
                                                        handleActionClick(
                                                            `Rental pass for ${item.id} generated.`
                                                        )
                                                    }
                                                >
                                                    Digital Key Pass
                                                </button>
                                            </>
                                        )}

                                        {item.status === 'upcoming' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn-action-danger"
                                                    disabled={cancellingId === item.id}
                                                    onClick={() =>
                                                        handleCancelBooking(item.id)
                                                    }
                                                >
                                                    {cancellingId === item.id
                                                        ? 'Cancelling...'
                                                        : 'Cancel'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-action-secondary"
                                                    onClick={() =>
                                                        handleActionClick(
                                                            `Modify window opened for ${item.id}.`
                                                        )
                                                    }
                                                >
                                                    Modify dates
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-action-primary"
                                                    onClick={() =>
                                                        handleActionClick(
                                                            `Voucher PDF for ${item.id} downloaded.`
                                                        )
                                                    }
                                                >
                                                    Download voucher
                                                </button>
                                            </>
                                        )}

                                        {item.status === 'completed' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn-action-secondary"
                                                    onClick={() =>
                                                        handleActionClick(
                                                            `Invoice for ${item.id} downloaded.`
                                                        )
                                                    }
                                                >
                                                    Invoice (PDF)
                                                </button>
                                                <Link
                                                    to="/booking"
                                                    className="btn-action-primary"
                                                >
                                                    Rent again
                                                </Link>
                                            </>
                                        )}

                                        {item.status === 'cancelled' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn-action-secondary"
                                                    onClick={() =>
                                                        handleActionClick(
                                                            `Refund receipt for ${item.id} downloaded.`
                                                        )
                                                    }
                                                >
                                                    Receipt
                                                </button>
                                                <Link
                                                    to="/fleet"
                                                    className="btn-action-primary"
                                                >
                                                    Browse fleet
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable details panel */}
                                {isExpanded && item.details && (
                                    <div className="booking-expanded-panel">
                                        <div className="expanded-item">
                                            <h4>Insurance</h4>
                                            <p>{item.details.insurance}</p>
                                            {item.details.deposit && (
                                                <p className="meta-note">
                                                    Deposit: <strong>{item.details.deposit}</strong>
                                                </p>
                                            )}
                                        </div>

                                        <div className="expanded-item">
                                            <h4>Mileage policy</h4>
                                            <p>{item.details.mileage}</p>
                                            <p className="meta-note">Fuel policy: Full-to-Full</p>
                                        </div>

                                        {item.details.extras && item.details.extras.length > 0 && (
                                            <div className="expanded-item">
                                                <h4>Included options</h4>
                                                <div className="extras-tags">
                                                    {item.details.extras.map((extra, idx) => (
                                                        <span key={idx}>{extra}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="expanded-item">
                                            <h4>Emergency contact</h4>
                                            <p>{item.details.support}</p>
                                            <p className="meta-note">
                                                Questions?{' '}
                                                <Link
                                                    to="/contact"
                                                    style={{ color: '#3b82f6' }}
                                                >
                                                    Contact support
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty state when user has no bookings */
                <div className="bookings-empty-box">
                    <div className="empty-icon-circle">
                        <Icons.Car />
                    </div>
                    <h3>No bookings yet</h3>
                    <p>
                        {searchQuery
                            ? `No reservation matches your search "${searchQuery}".`
                            : "You don't have any bookings yet. Choose a car from our fleet and hit the road!"}
                    </p>
                    <div className="empty-state-actions">
                        <Link to="/booking" className="btn-book-now">
                            Book a car now
                        </Link>
                        {!searchQuery && (
                            <button
                                type="button"
                                className="btn-action-secondary"
                                onClick={handleSeedSample}
                                disabled={isSeeding}
                            >
                                {isSeeding ? 'Adding samples...' : 'Add sample bookings (Demo)'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

export default MyBookings;
