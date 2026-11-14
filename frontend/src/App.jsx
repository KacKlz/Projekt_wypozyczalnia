import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';

import Header from './Header';
import Login from './Login';
import Register from './Register';
import Home from './layout/home/Home';
import Fleet from './layout/fleet/Fleet';
import About from './layout/about/About';
import Contact from './layout/contact/Contact';
import Booking from './layout/booking/Booking';

function App() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // Sprawdzenie sesji po odswiezeniu strony
    useEffect(() => {
        fetch('/api/auth/me')
            .then((response) => (response.ok ? response.json() : null))
            .then((userData) => setUser(userData))
            .catch(() => setUser(null))
            .finally(() => setIsCheckingSession(false));
    }, []);

    // Pomyslne logowanie
    const handleLoginSuccess = (userData) => {
        setUser(userData);
        navigate('/');
    };

    // Wylogowanie
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Wylogowanie lokalne nawet przy bledzie serwera
        }

        setUser(null);
        navigate('/login');
    };

    // Oczekiwanie na sprawdzenie sesji
    if (isCheckingSession) {
        return (
            <div className="app">
                <Header />
            </div>
        );
    }

    return (
        <div className="app">
            <Header user={user} onLogout={handleLogout} />

            <Routes>
                {/* Strona glowna */}
                <Route
                    path="/"
                    element={
                        user ? (
                            <Home />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Logowanie */}
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <Login
                                onSwitchToRegister={() => navigate('/register')}
                                onLoginSuccess={handleLoginSuccess}
                            />
                        )
                    }
                />

                {/* Rejestracja */}
                <Route
                    path="/register"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <Register
                                onSwitchToLogin={() => navigate('/login')}
                            />
                        )
                    }
                />

                {/* Flota */}
                <Route path="/fleet" element={<Fleet />} />

                {/* O nas */}
                <Route path="/about" element={<About />} />

                {/* Kontakt */}
                <Route path="/contact" element={<Contact />} />

                {/* Rezerwacja */}
                <Route
                    path="/booking"
                    element={
                        user ? (
                            <Booking />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Nieznany adres */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </div>
    );
}

export default App;
