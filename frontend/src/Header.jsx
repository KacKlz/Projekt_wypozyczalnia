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