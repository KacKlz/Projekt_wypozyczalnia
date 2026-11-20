import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import logoImage from './assets/CarLogo.png';
import UserMenu from './layout/header/UserMenu';

function Header({ user, onLogout }) {
    const { pathname } = useLocation();

    // Path on which the mobile menu was opened.
    // The menu is open only on that path, so it closes automatically after navigation.
    const [openedAt, setOpenedAt] = useState(null);
    const isNavOpen = openedAt === pathname;
    // Forget the stale path after navigating away, so the menu won't reopen on return
    if (openedAt !== null && !isNavOpen) {
        setOpenedAt(null);
    }

    const headerRef = useRef(null);
    const toggleRef = useRef(null);

    const closeNav = () => setOpenedAt(null);
    const toggleNav = () =>
        setOpenedAt((path) => (path === pathname ? null : pathname));

    // Close the menu on outside click or Escape key
    useEffect(() => {
        if (!isNavOpen) return;

        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setOpenedAt(null);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setOpenedAt(null);
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

    // Close the menu when any link inside it is clicked (also the current route)
    const handleNavClick = (event) => {
        if (event.target.closest('a')) {
            closeNav();
        }
    };

    return (
        <header className="header-bar" ref={headerRef}>
            <div className="logo-container">
                <Link to="/" onClick={closeNav}>
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
                onClick={toggleNav}
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
                onClick={handleNavClick}
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
                    <Link to="/booking" className="btn-header" onClick={closeNav}>
                        Book now
                    </Link>
                    <UserMenu user={user} onLogout={onLogout} />
                </div>
            )}
        </header>
    );
}

export default Header;
