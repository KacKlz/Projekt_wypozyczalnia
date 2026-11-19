import '../../styles/pages/FleetPage.css';
import { useNavigate } from 'react-router';


function Fleet() {
    const navigate = useNavigate();
    
    return (
        <main className="fleet-page">
            <section className="fleet-hero">
                <div className="hero-content">
                    <span className="hero-subtitle">
                        PREMIUM CAR RENTAL
                    </span>

                    <h1>
                        Find the perfect car
                        <br />
                        for your journey
                    </h1>

                    <p>
                        Browse our fleet and choose a vehicle tailored to
                        your travel needs.
                    </p>

                    <div className="hero-buttons">
                        <button onClick={() => navigate('/booking')}>
                            Book Now
                        </button>

                        <button
                            onClick={() =>
                                document
                                    .getElementById('fleet-section')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }
                        >
                            View Fleet
                        </button>
                    </div>
                </div>

                <div className="hero-search">
                    <h2>Search Vehicle</h2>

                    <div className="search-group">
                        <label>Location</label>
                        <select>
                            <option>Warsaw</option>
                            <option>Krakow</option>
                            <option>Gdansk</option>
                        </select>
                    </div>

                    <div className="search-dates">
                        <div className="search-group">
                            <label>Pickup Date</label>
                            <input type="date" />
                        </div>

                        <div className="search-group">
                            <label>Return Date</label>
                            <input type="date" />
                        </div>
                    </div>

                    <button className="search-btn">
                        Search Vehicles
                    </button>
                </div>
            </section>
            <section
                id="fleet-section"
                className="fleet-preview"
            >
                <div className="fleet-preview-header">
                    <h2>Our Fleet</h2>
                    <p>
                        Browse our range of vehicles available for rental.
                    </p>
                </div>

                <div className="fleet-preview-placeholder">
                    Vehicle catalogue will be available soon.
                </div>
            </section>
        </main>
    );
}

export default Fleet;