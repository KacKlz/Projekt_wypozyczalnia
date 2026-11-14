import { Link, NavLink } from 'react-router';
import logoImage from './assets/CarLogo.png';
import UserMenu from './UserMenu';


function Header({ user, onLogout }) {
    return (
        <header className="header-bar">
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

            <nav className="nav-menu">
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
