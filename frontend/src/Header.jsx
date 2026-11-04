import logoImage from './assets/CarLogo.png';

function Header({ onNavigate }) {
    return (
        <header className="header-bar">
            <div className="logo-container" onClick={() => onNavigate && onNavigate('home')} style={{ cursor: 'pointer' }}>
                <img 
                    src={logoImage} 
                    alt="Car Rental Logo" 
                    className="logo-image" 
                />
                <h1 className="title-text">Cars-rent.pl</h1>
            </div>

            <nav className="nav-menu">
                <button type="button" className="nav-link" onClick={() => onNavigate && onNavigate('home')}>
                    Home
                </button>
                <button type="button" className="nav-link" onClick={() => onNavigate && onNavigate('login')}>
                    Sign In
                </button>
                <button type="button" className="nav-link" onClick={() => onNavigate && onNavigate('register')}>
                    Sign Up
                </button>
            </nav>
        </header>
    );
}

export default Header;