import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import './styles/userMenu/UserMenu.css';


function UserMenu({ user, onLogout }) {
    // Stan menu i dane uzytkownika
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const userName = user?.imie || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        setIsMenuOpen(false);
        onLogout();
    };

    // Zamykanie menu po kliknieciu poza nim lub klawiszem Esc
    useEffect(() => {
        if (!isMenuOpen) return;

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMenuOpen]);

    // Avatar i rozwijana lista
    return (
        <div className="user-menu" ref={menuRef}>
            <button
                type="button"
                className="user-menu-trigger"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                aria-label="User menu"
            >
                <span className="user-avatar">{userInitial}</span>
                <span className={`user-menu-chevron${isMenuOpen ? ' open' : ''}`}>
                    ▾
                </span>
            </button>

            {isMenuOpen && (
                <div className="user-menu-dropdown" role="menu">
                    <p className="user-menu-greeting">
                        Hello, {userName}!
                    </p>
                    <Link
                        to="/my-bookings"
                        className="user-menu-item"
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        My bookings
                    </Link>
                    <button
                        type="button"
                        className="user-menu-item user-menu-logout"
                        role="menuitem"
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserMenu;