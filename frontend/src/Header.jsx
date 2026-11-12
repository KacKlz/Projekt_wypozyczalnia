import { Link } from 'react-router';
import logoImage from './assets/CarLogo.png';

function Header({ user, onLogout }) {
    return (
        <header className="header-bar">
            <div className="logo-container">
                <img
                    src={logoImage}
                    alt="Car Rental Logo"
                    className="logo-image"
                />
                <h1 className="title-text">Cars-rent.pl</h1>
            </div>

            <nav className="nav-menu">
                <Link to="/" className="nav-link">
                    Home
                </Link>
                {!user && (
                    <>
                        <Link to="/login" className="nav-link">
                            Sign In
                        </Link>
                        <Link to="/register" className="nav-link">
                            Sign Up
                        </Link>
                    </>
                )}
            </nav>

            {user && (
                <div className="header-actions">
                    <span className="header-greeting">
                        Hello, {user.imie || 'User'}!
                    </span>
                    <button className="btn-header" onClick={onLogout}>
                        Log out
                    </button>
                </div>
            )}
        </header>
    );
}

export default Header;
