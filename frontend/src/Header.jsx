import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import logoImage from './assets/CarLogo.png';
import UserMenu from './layout/header/UserMenu';

function Header({ user, onLogout }) {
    // Mobile menu (hamburger) state
    const [isNavOpen, setIsNavOpen] = useState(false);
    const headerRef = useRef(null);
    const toggleRef = useRef(null);
    const location = useLocation();

    // Close the menu whenever the route changes
    useEffect(() => {
        setIsNavOpen(false);
    }, [location.pathname]);

    // Close the menu on outside click or Escape key
    useEffect(() => {
        if (!isNavOpen) return;

        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setIsNavOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsNavOpen(false);
                toggleRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isNavOpen]);

    return (
        <header className="header-bar" ref={headerRef}>
            <div className="logo-container">
                <Link to="/">
                    <img
                        src={logoImage}
                        alt="Car Rental Logo"
                        className="logo-image"
                    />
                </Link>
                <h1 className="title-text">Cars-rent.pl</h1>
            </div>

            <button
                type="button"
                ref={toggleRef}
                className={`nav-toggle${isNavOpen ? ' open' : ''}`}
                onClick={() => setIsNavOpen((open) => !open)}
                aria-label="Menu"
                aria-expanded={isNavOpen}
                aria-controls="main-nav"
            >
                <span className="nav-toggle-bar"></span>
                <span className="nav-toggle-bar"></span>
                <span className="nav-toggle-bar"></span>
            </button>

            <nav
                id="main-nav"
                className={`nav-menu${isNavOpen ? ' open' : ''}`}
            >
                <NavLink to="/" end className="nav-link">
                    Home
                </NavLink>
                <NavLink to="/fleet" className="nav-link">
                    Our fleet
                </NavLink>
                <NavLink to="/about" className="nav-link">
                    About
                </NavLink>
                <NavLink to="/contact" className="nav-link">
                    Contact
                </NavLink>

                {!user && (
                    <>
                        <NavLink to="/login" className="nav-link">
                            Sign In
                        </NavLink>
                        <NavLink to="/register" className="nav-link">
                            Sign Up
                        </NavLink>
                    </>
                )}
            </nav>

            {user && (
                <div className="header-actions">
                    <Link to="/booking" className="btn-header">
                        Book now
                    </Link>
                    <UserMenu user={user} onLogout={onLogout} />
                </div>
            )}
        </header>
    );
}

export default Header;